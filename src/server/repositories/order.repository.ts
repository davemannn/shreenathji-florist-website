import { prisma } from "@/server/db/prisma";

export interface CreateOrderItemInput {
  productId?: string;
  variantId?: string;
  productTitle: string;
  variantLabel?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CreateOrderInput {
  orderNumber: string;
  userId: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: "COD" | "RAZORPAY";
  recipientName: string;
  recipientPhone: string;
  deliveryLine1: string;
  deliveryLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  deliveryDate: Date;
  deliverySlotId?: string;
  messageCard?: string;
  giftWrap: boolean;
  couponId?: string;
  items: CreateOrderItemInput[];
}

/**
 * Nested Prisma writes (`create` with a nested relation `create`) execute as
 * a single atomic operation — the Order and all its OrderItems either all
 * land or none do, no separate `$transaction` wrapper needed.
 */
export async function createOrder(input: CreateOrderInput) {
  const { items, ...orderData } = input;

  return prisma.order.create({
    data: {
      ...orderData,
      items: { create: items },
    },
    include: { items: true },
  });
}

export async function findOrderByNumber(orderNumber: string, userId: string) {
  return prisma.order.findFirst({
    where: { orderNumber, userId },
    include: { items: true, deliverySlot: true, coupon: true },
  });
}

/** Scoped by userId too — never trust a client-supplied orderId alone before mutating payment state. */
export async function findOrderById(orderId: string, userId: string) {
  return prisma.order.findFirst({ where: { id: orderId, userId } });
}

export async function attachRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { razorpayOrderId },
  });
}

export async function markOrderPaid(orderId: string, razorpayPaymentId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId },
  });
}

export async function markOrderConfirmedCod(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CONFIRMED" },
  });
}
