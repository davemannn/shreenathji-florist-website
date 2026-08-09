import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/server/payments/razorpay";
import { updateCustomerSubscriptionStatus } from "@/server/repositories/customer-subscription.repository";
import { handleSubscriptionCharged } from "@/server/services/subscription.service";

interface RazorpaySubscriptionEntity {
  id: string;
  current_end?: number | null;
}

interface RazorpayPaymentEntity {
  id: string;
}

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    subscription?: { entity: RazorpaySubscriptionEntity };
    payment?: { entity: RazorpayPaymentEntity };
  };
}

/**
 * The only server-to-server (not user-click-driven) mutation path in this
 * app — recurring subscription charges happen automatically in the
 * background with no request from a signed-in user to attach normal auth
 * to, so Razorpay's webhook signature is the entire trust boundary here.
 *
 * Must read the RAW body (not parsed JSON) to verify the signature — even
 * whitespace differences from re-serializing would break the HMAC match.
 * Configure in the Razorpay Dashboard: Webhooks > add
 * https://<domain>/api/webhooks/razorpay, subscribed to at least
 * subscription.activated / .charged / .cancelled / .completed / .halted /
 * .pending, secret set as RAZORPAY_WEBHOOK_SECRET.
 *
 * Returns non-2xx on anything that should be retried (Razorpay retries
 * failed webhook deliveries automatically) — a transient DB hiccup or a
 * subscription row that hasn't landed yet from a race with the create
 * step both fall into that bucket.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let isValid: boolean;
  try {
    isValid = verifyRazorpayWebhookSignature(rawBody, signature);
  } catch (error) {
    console.error("Razorpay webhook signature check failed:", error);
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await handleEvent(payload);
  } catch (error) {
    console.error(`Razorpay webhook handling failed for event "${payload.event}":`, error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(payload: RazorpayWebhookPayload) {
  const sub = payload.payload.subscription?.entity;

  switch (payload.event) {
    case "subscription.authenticated": {
      if (!sub) return;
      await updateCustomerSubscriptionStatus(sub.id, "AUTHENTICATED");
      return;
    }
    case "subscription.activated": {
      if (!sub) return;
      await updateCustomerSubscriptionStatus(sub.id, "ACTIVE", {
        currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : undefined,
      });
      return;
    }
    case "subscription.charged": {
      if (!sub) return;
      const payment = payload.payload.payment?.entity;
      await handleSubscriptionCharged(
        sub.id,
        payment?.id,
        sub.current_end ? new Date(sub.current_end * 1000) : undefined,
      );
      return;
    }
    case "subscription.pending": {
      if (!sub) return;
      // A charge attempt failed but Razorpay will retry automatically —
      // not yet halted, just flagged so admin visibility isn't silent.
      await updateCustomerSubscriptionStatus(sub.id, "PENDING");
      return;
    }
    case "subscription.halted": {
      if (!sub) return;
      // Repeated charge failures — Razorpay has given up retrying.
      // Customer needs to update their payment method to resume.
      await updateCustomerSubscriptionStatus(sub.id, "HALTED");
      return;
    }
    case "subscription.cancelled": {
      if (!sub) return;
      await updateCustomerSubscriptionStatus(sub.id, "CANCELLED", { cancelledAt: new Date() });
      return;
    }
    case "subscription.completed": {
      if (!sub) return;
      await updateCustomerSubscriptionStatus(sub.id, "COMPLETED");
      return;
    }
    default:
      // Every other event (payment.failed, invoice.*, refund.*, ...) is
      // either handled elsewhere (the one-time-order payment flow has its
      // own client-side verification, not this webhook) or not yet acted
      // on — ignored rather than erroring, so Razorpay doesn't retry
      // delivery of events this endpoint was never meant to handle.
      return;
  }
}
