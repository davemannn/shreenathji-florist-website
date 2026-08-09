import {
  createOrder as createOrderRow,
  markOrderPaid,
} from "@/server/repositories/order.repository";
import {
  createCustomerSubscription,
  findCustomerSubscriptionByRazorpayId,
  updateCustomerSubscriptionStatus,
} from "@/server/repositories/customer-subscription.repository";
import {
  findSubscriptionPlanInterval,
  upsertSubscriptionPlanInterval,
} from "@/server/repositories/subscription-plan.repository";
import {
  createRazorpayPlan,
  createRazorpaySubscription,
  cancelRazorpaySubscription,
  fetchRazorpayPaymentDetails,
  type RazorpayBillingInterval,
} from "@/server/payments/razorpay";
import { getStoreSettings } from "@/features/settings/queries";
import { sendEmail } from "@/server/email/mailer";
import { OrderConfirmationEmail } from "@/emails/order-confirmation-email";
import { siteConfig } from "@/config/site";
import { splitInclusiveTax, splitGst, isInterStateOrder } from "@/lib/tax";

export interface StartSubscriptionInput {
  userId: string;
  userName: string;
  subscriptionPlanIntervalId: string;
  recipientName: string;
  recipientPhone: string;
  deliveryLine1: string;
  deliveryLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
}

/**
 * Creates the Razorpay Plan (if this interval doesn't already have one —
 * Plans are immutable, so once created it's reused for every subscriber at
 * that price) and Subscription, plus the local CustomerSubscription row
 * (status CREATED — becomes ACTIVE once the customer completes the
 * Checkout.js authorization payment and the subscription.activated webhook
 * arrives). Doesn't charge anything itself; that's the client-side
 * Checkout.js step right after this returns.
 */
export async function startSubscription(input: StartSubscriptionInput) {
  const interval = await findSubscriptionPlanInterval(input.subscriptionPlanIntervalId);
  if (!interval) {
    throw new Error("That subscription plan is no longer available.");
  }
  if (!interval.subscriptionPlan.isActive) {
    throw new Error("That subscription plan is no longer available.");
  }

  let razorpayPlanId = interval.razorpayPlanId;
  if (!razorpayPlanId) {
    razorpayPlanId = await createRazorpayPlan(
      interval.interval as RazorpayBillingInterval,
      interval.price,
      interval.subscriptionPlan.name,
    );
    await upsertSubscriptionPlanInterval(interval.subscriptionPlanId, interval.interval, {
      price: interval.price,
      discountPercent: interval.discountPercent,
      razorpayPlanId,
    });
  }

  const { razorpaySubscriptionId } = await createRazorpaySubscription(
    razorpayPlanId,
    interval.interval as RazorpayBillingInterval,
    { customerName: input.userName, planName: interval.subscriptionPlan.name },
  );

  const subscription = await createCustomerSubscription({
    userId: input.userId,
    subscriptionPlanId: interval.subscriptionPlanId,
    subscriptionPlanIntervalId: interval.id,
    razorpaySubscriptionId,
    recipientName: input.recipientName,
    recipientPhone: input.recipientPhone,
    deliveryLine1: input.deliveryLine1,
    deliveryLine2: input.deliveryLine2,
    deliveryCity: input.deliveryCity,
    deliveryState: input.deliveryState,
    deliveryPincode: input.deliveryPincode,
  });

  return { subscriptionId: subscription.id, razorpaySubscriptionId };
}

function generateOrderNumber(): string {
  return `SNF-SUB${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Called from the Razorpay webhook on `subscription.charged` — creates a
 * real Order for this billing cycle (same admin pipeline as any other
 * order: shows in /admin/orders, gets an invoice, etc.) and marks it paid
 * immediately, since the charge already succeeded by the time this event
 * arrives. Idempotent per Razorpay payment id would be ideal, but Razorpay
 * doesn't hand back an easy natural key to dedupe on beyond the payment id
 * itself, which this doesn't currently check for replay — acceptable risk
 * given webhook retries only happen on a non-2xx response, and this path
 * always returns 200 once it completes once.
 */
export async function handleSubscriptionCharged(
  razorpaySubscriptionId: string,
  razorpayPaymentId: string | undefined,
  currentPeriodEnd: Date | undefined,
) {
  const subscription = await findCustomerSubscriptionByRazorpayId(razorpaySubscriptionId);
  if (!subscription) {
    throw new Error(
      `No local subscription found for Razorpay subscription ${razorpaySubscriptionId}.`,
    );
  }

  const settings = await getStoreSettings();
  const isInterState = isInterStateOrder(subscription.deliveryState, settings.registeredState);
  const price = subscription.planInterval.price;
  const { taxableValue, taxAmount } = splitInclusiveTax(price, settings.defaultGstRate);
  const { cgstAmount, sgstAmount, igstAmount } = splitGst(taxAmount, isInterState);

  const order = await createOrderRow({
    orderNumber: generateOrderNumber(),
    userId: subscription.userId,
    subtotal: price,
    discount: 0,
    deliveryCharge: 0,
    total: price,
    paymentMethod: "RAZORPAY",
    recipientName: subscription.recipientName,
    recipientPhone: subscription.recipientPhone,
    deliveryLine1: subscription.deliveryLine1,
    deliveryLine2: subscription.deliveryLine2 ?? undefined,
    deliveryCity: subscription.deliveryCity,
    deliveryState: subscription.deliveryState,
    deliveryPincode: subscription.deliveryPincode,
    deliveryDate: new Date(),
    giftWrap: false,
    subscriptionId: subscription.id,
    sellerGstin: settings.gstin ?? undefined,
    sellerState: settings.registeredState,
    isInterState,
    taxableValue,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax: taxAmount,
    items: [
      {
        productTitle: `${subscription.plan.name} — ${subscription.planInterval.interval.toLowerCase()} delivery`,
        unitPrice: price,
        quantity: 1,
        lineTotal: price,
        gstRate: settings.defaultGstRate,
        taxableValue,
        taxAmount,
      },
    ],
  });

  await updateCustomerSubscriptionStatus(razorpaySubscriptionId, "ACTIVE", { currentPeriodEnd });

  if (razorpayPaymentId) {
    let txnDetails;
    try {
      txnDetails = await fetchRazorpayPaymentDetails(razorpayPaymentId);
    } catch {
      // Best-effort, same as the regular checkout flow — a failed detail
      // lookup shouldn't undo an already-successful charge.
    }
    await markOrderPaid(order.id, razorpayPaymentId, txnDetails);
  }

  // Best-effort, same non-fatal pattern as the regular checkout confirmation
  // email — reuses that exact template, since this is a genuine Order by
  // the time this fires (same fields, same invoice link).
  try {
    await sendEmail({
      to: subscription.user.email,
      subject: `Order ${order.orderNumber} confirmed — ${subscription.plan.name} subscription`,
      react: OrderConfirmationEmail({
        customerName: subscription.user.name,
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          productTitle: item.productTitle,
          variantLabel: item.variantLabel ?? undefined,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        deliveryDate: order.deliveryDate.toISOString(),
        deliveryAddress: [
          order.deliveryLine1,
          order.deliveryLine2,
          order.deliveryCity,
          order.deliveryState,
          order.deliveryPincode,
        ]
          .filter(Boolean)
          .join(", "),
        total: order.total,
        paymentMethod: order.paymentMethod,
        walletAmountUsed: order.walletAmountUsed,
        invoiceUrl: `${siteConfig.url}/invoice/${order.orderNumber}`,
        storeAddressLine: settings.registeredAddressLine,
        storeCity: settings.registeredCity,
        storePincode: settings.registeredPincode,
      }),
    });
  } catch {
    // Non-fatal — the order itself is already correctly created either way.
  }

  return order;
}

export async function cancelSubscription(
  razorpaySubscriptionId: string,
  cancelAtCycleEnd: boolean,
) {
  await cancelRazorpaySubscription(razorpaySubscriptionId, cancelAtCycleEnd);
  // The subscription.cancelled webhook is the authoritative status update
  // (Razorpay may not finalize the cancellation synchronously, especially
  // for cancelAtCycleEnd) — this just reflects the request immediately in
  // the UI rather than waiting on the webhook round trip.
  await updateCustomerSubscriptionStatus(razorpaySubscriptionId, "CANCELLED", {
    cancelledAt: new Date(),
  });
}
