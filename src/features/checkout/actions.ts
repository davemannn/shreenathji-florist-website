"use server";

import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import { placeOrder, type CartLineItemInput } from "@/server/services/order.service";
import {
  createRazorpayOrder,
  getRazorpayPublicKeyId,
  verifyRazorpaySignature,
} from "@/server/payments/razorpay";
import {
  attachRazorpayOrderId,
  findOrderById,
  markOrderConfirmedCod,
  markOrderPaid,
} from "@/server/repositories/order.repository";
import { createAddress } from "@/server/repositories/address.repository";

interface PlaceOrderActionInput {
  items: CartLineItemInput[];
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  deliveryDate: string;
  deliverySlotId?: string;
  messageCard?: string;
  giftWrap: boolean;
  couponCode?: string;
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

export async function placeOrderAction(input: PlaceOrderActionInput) {
  const userId = await requireUserId();

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
    deliveryDate: new Date(input.deliveryDate),
    deliverySlotId: input.deliverySlotId,
    messageCard: input.messageCard,
    giftWrap: input.giftWrap,
    couponCode: input.couponCode,
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
    });
  }

  if (input.paymentMethod === "RAZORPAY") {
    const razorpayOrder = await createRazorpayOrder(order.total, order.orderNumber);
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

  await markOrderPaid(order.id, input.razorpayPaymentId);

  return { orderNumber: order.orderNumber };
}
