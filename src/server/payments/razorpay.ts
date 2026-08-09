import { createHmac } from "crypto";
import Razorpay from "razorpay";

/**
 * Server-only Razorpay client, lazily instantiated.
 *
 * Kept as a function (not a module-level singleton) so importing this file
 * never throws just because RAZORPAY_KEY_ID/SECRET aren't set yet in this
 * environment — the error only surfaces when checkout code actually calls
 * getRazorpayClient().
 */
export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Razorpay's SDK throws a plain `{ statusCode, error: { description, code,
 * ... } }` object on API failures — NOT an `Error` instance (see
 * node_modules/razorpay/dist/api.js's normalizeError). Left as-is, that
 * object serializes into an unreadable stringified blob by the time it
 * crosses the server-action boundary, and `error instanceof Error` checks
 * everywhere else in this codebase silently fail to catch it. Every
 * Razorpay SDK call in this module goes through this wrapper so a real,
 * readable Error (with Razorpay's own description) always comes out.
 */
async function callRazorpay<T>(fn: () => Promise<T>, fallbackMessage: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Error) throw err;
    const description =
      err && typeof err === "object" && "error" in err
        ? ((err as { error?: { description?: string } }).error?.description ?? undefined)
        : undefined;
    throw new Error(description ?? fallbackMessage);
  }
}

/** Creates a Razorpay order. `amountInRupees` is converted to paise here — the one place that conversion happens. */
export async function createRazorpayOrder(amountInRupees: number, receipt: string) {
  const client = getRazorpayClient();
  return callRazorpay(
    () =>
      client.orders.create({
        amount: Math.round(amountInRupees * 100),
        currency: "INR",
        receipt,
      }),
    "Couldn't create the Razorpay order.",
  );
}

/** The public key id the client-side Checkout.js widget needs — safe to send to the browser (unlike the secret). */
export function getRazorpayPublicKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Razorpay is not configured: set RAZORPAY_KEY_ID.");
  }
  return keyId;
}

interface VerifyRazorpaySignatureParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/** Per Razorpay's documented verification scheme: HMAC-SHA256 of "order_id|payment_id" using the key secret. */
export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: VerifyRazorpaySignatureParams): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay is not configured: set RAZORPAY_KEY_SECRET.");
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expectedSignature === razorpaySignature;
}

interface VerifyRazorpaySubscriptionSignatureParams {
  razorpaySubscriptionId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * A DIFFERENT HMAC input than verifyRazorpaySignature above — Razorpay's
 * documented scheme for the subscription authorization payment is
 * "payment_id|subscription_id" (payment first, order reversed from the
 * regular order flow's "order_id|payment_id"), same key secret either way.
 * Always verify against the subscriptionId already on file for this
 * customer, never one taken fresh off the client response.
 */
export function verifyRazorpaySubscriptionSignature({
  razorpaySubscriptionId,
  razorpayPaymentId,
  razorpaySignature,
}: VerifyRazorpaySubscriptionSignatureParams): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay is not configured: set RAZORPAY_KEY_SECRET.");
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
    .digest("hex");

  return expectedSignature === razorpaySignature;
}

export interface RazorpayPaymentDetails {
  method: string | null;
  contact: string | null;
  email: string | null;
  vpa: string | null;
  bank: string | null;
  wallet: string | null;
  cardLast4: string | null;
  cardNetwork: string | null;
}

/**
 * Pulls the actual transaction record from Razorpay's own API — the
 * client-side Checkout.js callback only ever hands back IDs + a signature,
 * nothing about how the customer actually paid. Called once, right after
 * signature verification (checkout/actions.ts) — best-effort by the
 * caller, since the order is already legitimately paid by then and a
 * failed detail lookup shouldn't undo that.
 */
export async function fetchRazorpayPaymentDetails(
  paymentId: string,
): Promise<RazorpayPaymentDetails> {
  const client = getRazorpayClient();
  const payment = await callRazorpay(
    () => client.payments.fetch(paymentId),
    "Couldn't fetch payment details from Razorpay.",
  );

  return {
    method: payment.method ?? null,
    contact: payment.contact ? String(payment.contact) : null,
    email: payment.email ?? null,
    vpa: payment.vpa ?? null,
    bank: payment.bank ?? null,
    wallet: payment.wallet ?? null,
    cardLast4: payment.card?.last4 ?? null,
    cardNetwork: payment.card?.network ?? null,
  };
}

export interface RazorpayRefundResult {
  razorpayRefundId: string;
  status: string;
}

/** `amountInRupees` is converted to paise here, same as createRazorpayOrder — the one place that conversion happens for refunds. */
export async function refundRazorpayPayment(
  paymentId: string,
  amountInRupees: number,
  notes?: Record<string, string>,
): Promise<RazorpayRefundResult> {
  const client = getRazorpayClient();
  const refund = await callRazorpay(
    () =>
      client.payments.refund(paymentId, {
        amount: Math.round(amountInRupees * 100),
        speed: "normal",
        notes,
      }),
    "Couldn't process the refund with Razorpay.",
  );

  return { razorpayRefundId: refund.id, status: refund.status };
}

// ---------------------------------------------------------------------------
// Subscriptions — Razorpay's Plans/Subscriptions API family, distinct from
// the Orders/Payments API above. A Plan is interval-specific (weekly vs.
// monthly vs. yearly are three separate Plan objects); a Subscription is a
// customer's instance of one Plan, authorized once via Checkout.js
// (subscription_id instead of order_id) and then charged automatically in
// the background — see app/api/webhooks/razorpay/route.ts for the
// server-to-server side of that.
// ---------------------------------------------------------------------------

export type RazorpayBillingInterval = "WEEKLY" | "MONTHLY" | "ANNUAL";

const RAZORPAY_PERIOD_FOR: Record<RazorpayBillingInterval, "weekly" | "monthly" | "yearly"> = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  ANNUAL: "yearly",
};

/**
 * Razorpay requires a finite `total_count` of billing cycles per
 * subscription — there's no literal "bill forever until cancelled" option.
 * These give ~10 years of runway at each cadence; the customer can cancel
 * any time well before it's ever exhausted, same as how a real "until
 * cancelled" subscription behaves in practice.
 */
const TOTAL_COUNT_FOR: Record<RazorpayBillingInterval, number> = {
  WEEKLY: 520,
  MONTHLY: 120,
  ANNUAL: 10,
};

/** Creates the Razorpay Plan object a SubscriptionPlanInterval's `razorpayPlanId` points at. `priceInRupees` is converted to paise here. */
export async function createRazorpayPlan(
  interval: RazorpayBillingInterval,
  priceInRupees: number,
  itemName: string,
): Promise<string> {
  const client = getRazorpayClient();
  const plan = await callRazorpay(
    () =>
      client.plans.create({
        period: RAZORPAY_PERIOD_FOR[interval],
        interval: 1,
        item: {
          name: itemName,
          amount: Math.round(priceInRupees * 100),
          currency: "INR",
        },
      }),
    "Couldn't create the Razorpay plan.",
  );
  return plan.id;
}

export interface CreateRazorpaySubscriptionResult {
  razorpaySubscriptionId: string;
}

/** Creates a Subscription against an existing Plan — the customer still has to authorize it via Checkout.js (subscription_id) before it actually starts billing. */
export async function createRazorpaySubscription(
  razorpayPlanId: string,
  interval: RazorpayBillingInterval,
  notes?: Record<string, string>,
): Promise<CreateRazorpaySubscriptionResult> {
  const client = getRazorpayClient();
  const subscription = await callRazorpay(
    () =>
      client.subscriptions.create({
        plan_id: razorpayPlanId,
        total_count: TOTAL_COUNT_FOR[interval],
        customer_notify: true,
        notes,
      }),
    "Couldn't create the Razorpay subscription.",
  );
  return { razorpaySubscriptionId: subscription.id };
}

/** `cancelAtCycleEnd: true` lets the current, already-paid-for cycle finish instead of stopping immediately — surfaced as a choice in the admin/customer cancel UI. */
export async function cancelRazorpaySubscription(
  razorpaySubscriptionId: string,
  cancelAtCycleEnd: boolean,
): Promise<void> {
  const client = getRazorpayClient();
  await callRazorpay(
    () => client.subscriptions.cancel(razorpaySubscriptionId, cancelAtCycleEnd),
    "Couldn't cancel the Razorpay subscription.",
  );
}

export async function pauseRazorpaySubscription(razorpaySubscriptionId: string): Promise<void> {
  const client = getRazorpayClient();
  await callRazorpay(
    () => client.subscriptions.pause(razorpaySubscriptionId, { pause_at: "now" }),
    "Couldn't pause the Razorpay subscription.",
  );
}

export async function resumeRazorpaySubscription(razorpaySubscriptionId: string): Promise<void> {
  const client = getRazorpayClient();
  await callRazorpay(
    () => client.subscriptions.resume(razorpaySubscriptionId, { resume_at: "now" }),
    "Couldn't resume the Razorpay subscription.",
  );
}

/**
 * Webhook signature verification — a DIFFERENT scheme than
 * verifyRazorpaySignature above (that one HMACs "order_id|payment_id" using
 * the payment key secret; this one HMACs the raw request body using a
 * separate webhook secret configured in the Razorpay Dashboard). Must run
 * against the exact raw body string, not a re-serialized parsed object —
 * even whitespace differences would break the signature match.
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Razorpay webhooks are not configured: set RAZORPAY_WEBHOOK_SECRET.");
  }

  const expectedSignature = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return expectedSignature === signature;
}
