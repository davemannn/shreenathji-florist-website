"use server";

import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import { placeOrder, type CartLineItemInput } from "@/server/services/order.service";
import {
  createRazorpayOrder,
  fetchRazorpayPaymentDetails,
  getRazorpayPublicKeyId,
  verifyRazorpaySignature,
} from "@/server/payments/razorpay";
import {
  attachRazorpayOrderId,
  findOrderById,
  markOrderConfirmedCod,
  markOrderPaid,
  markOrderPaidByWallet,
} from "@/server/repositories/order.repository";
import { createAddress } from "@/server/repositories/address.repository";
import { sendEmail, STORE_INBOX } from "@/server/email/mailer";
import { OrderConfirmationEmail } from "@/emails/order-confirmation-email";
import { AdminNewOrderAlertEmail } from "@/emails/admin-new-order-alert-email";
import { getStoreSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";

interface PlaceOrderActionInput {
  items: CartLineItemInput[];
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  deliveryDate: string;
  deliverySlotId?: string;
  messageCard?: string;
  giftWrap: boolean;
  couponCode?: string;
  useWallet?: boolean;
  paymentMethod: "COD" | "RAZORPAY";
  saveAddress?: boolean;
}

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to place an order.");
  }
  return session.user.id;
}

async function requireSessionUser(): Promise<{ id: string; email: string; name: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to place an order.");
  }
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}

interface OrderConfirmationEmailOrder {
  id: string;
  orderNumber: string;
  total: number;
  walletAmountUsed: number;
  paymentMethod: "COD" | "RAZORPAY" | "WALLET";
  deliveryDate: Date;
  deliveryLine1: string;
  deliveryLine2: string | null;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  deliverySlot: { label: string } | null;
  items: {
    productTitle: string;
    variantLabel: string | null;
    quantity: number;
    lineTotal: number;
  }[];
}

/**
 * Shared by both the COD and Razorpay confirmation paths below — best-
 * effort (the order itself already succeeded either way, so a failed/
 * unconfigured email send shouldn't surface as a checkout error), matching
 * the existing gift-card email's non-fatal try/catch pattern.
 */
async function sendOrderConfirmationEmail(
  order: OrderConfirmationEmailOrder,
  customer: { email: string; name: string },
) {
  try {
    const settings = await getStoreSettings();
    await sendEmail({
      to: customer.email,
      subject: `Order ${order.orderNumber} confirmed — Shrinathji Florist`,
      react: OrderConfirmationEmail({
        customerName: customer.name,
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          productTitle: item.productTitle,
          variantLabel: item.variantLabel ?? undefined,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        deliveryDate: order.deliveryDate.toISOString(),
        deliverySlotLabel: order.deliverySlot?.label,
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
    // Email isn't configured, or the send failed — not fatal to the order.
  }

  // Admin alert — the email equivalent of the in-app dashboard chime
  // (use-order-notifications.ts), for whenever nobody has an admin tab
  // open. Independent try/catch: a failure here should never affect
  // whether the customer's own confirmation email above went out.
  try {
    await sendEmail({
      to: STORE_INBOX,
      subject: `New order ${order.orderNumber} — ${customer.name}`,
      react: AdminNewOrderAlertEmail({
        orderNumber: order.orderNumber,
        customerName: customer.name,
        total: order.total,
        paymentMethod: order.paymentMethod,
        walletAmountUsed: order.walletAmountUsed,
        orderUrl: `${siteConfig.url}/admin/orders/${order.id}`,
      }),
    });
  } catch {
    // Same as above — not fatal to the order.
  }
}

export async function placeOrderAction(input: PlaceOrderActionInput) {
  const user = await requireSessionUser();
  const userId = user.id;

  if (input.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const order = await placeOrder({
    userId,
    items: input.items,
    recipientName: input.recipientName,
    recipientPhone: input.recipientPhone,
    deliveryLine1: input.line1,
    deliveryLine2: input.line2,
    deliveryCity: input.city,
    deliveryState: input.state,
    deliveryPincode: input.pincode,
    deliveryLatitude: input.latitude,
    deliveryLongitude: input.longitude,
    deliveryDate: new Date(input.deliveryDate),
    deliverySlotId: input.deliverySlotId,
    messageCard: input.messageCard,
    giftWrap: input.giftWrap,
    couponCode: input.couponCode,
    useWallet: input.useWallet,
    paymentMethod: input.paymentMethod,
  });

  if (input.saveAddress) {
    await createAddress({
      userId,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      latitude: input.latitude,
      longitude: input.longitude,
    });
  }

  // Wallet balance covered the full total (order.service.ts resolves this,
  // never the client's requested method) — no gateway step and no cash due,
  // so it's confirmed/paid immediately, same as COD's "no step to wait on"
  // below but also marking paymentStatus PAID since the wallet debit
  // already settled it.
  if (order.paymentMethod === "WALLET") {
    await markOrderPaidByWallet(order.id);
    await sendOrderConfirmationEmail(order, user);
    return { orderId: order.id, orderNumber: order.orderNumber, razorpay: null };
  }

  if (order.paymentMethod === "RAZORPAY") {
    // Only what's still owed after any wallet amount already deducted —
    // order.total itself is unchanged (same pattern as discount).
    const amountDue = order.total - order.walletAmountUsed;
    const razorpayOrder = await createRazorpayOrder(amountDue, order.orderNumber);
    await attachRazorpayOrderId(order.id, razorpayOrder.id);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpay: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        keyId: getRazorpayPublicKeyId(),
      },
    };
  }

  // COD: no payment gateway step to wait for — the order itself is
  // confirmed immediately (payment is still collected on delivery, so
  // paymentStatus stays PENDING).
  await markOrderConfirmedCod(order.id);
  await sendOrderConfirmationEmail(order, user);

  return { orderId: order.id, orderNumber: order.orderNumber, razorpay: null };
}

interface VerifyPaymentActionInput {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function verifyRazorpayPaymentAction(input: VerifyPaymentActionInput) {
  const userId = await requireUserId();

  // Scoped lookup — never mark payment state on an order without confirming
  // it actually belongs to the caller first.
  const order = await findOrderById(input.orderId, userId);
  if (!order) {
    throw new Error("Order not found.");
  }

  const isValid = verifyRazorpaySignature({
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
  });

  if (!isValid) {
    throw new Error("Payment verification failed. Please contact support if you were charged.");
  }

  // Best-effort — the payment is already legitimately verified/captured by
  // the signature check above regardless of whether this extra lookup
  // succeeds, so a failure here shouldn't block marking the order paid.
  let txnDetails: Awaited<ReturnType<typeof fetchRazorpayPaymentDetails>> | undefined;
  try {
    txnDetails = await fetchRazorpayPaymentDetails(input.razorpayPaymentId);
  } catch {
    // Razorpay API hiccup, or details not available yet — order still gets marked paid.
  }

  await markOrderPaid(order.id, input.razorpayPaymentId, txnDetails);
  await sendOrderConfirmationEmail(order, order.user);

  return { orderNumber: order.orderNumber };
}
