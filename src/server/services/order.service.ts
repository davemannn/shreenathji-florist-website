import {
  createOrder as createOrderRow,
  type CreateOrderItemInput,
} from "@/server/repositories/order.repository";
import {
  findActiveCouponByCode,
  incrementCouponUsage,
} from "@/server/repositories/coupon.repository";
import { findDeliverySlotById } from "@/server/repositories/delivery-slot.repository";

// No DeliveryZone/pincode-based pricing table for this pass (see the
// commerce-milestone plan) — flat charge + free-delivery threshold, plus
// each DeliverySlot's own extraCharge (e.g. midnight delivery costs more).
export const BASE_DELIVERY_CHARGE = 49;
export const FREE_DELIVERY_THRESHOLD = 999;

export interface CartLineItemInput {
  productId: string;
  variantId: string;
  productTitle: string;
  variantLabel: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface PlaceOrderInput {
  userId: string;
  items: CartLineItemInput[];
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
  couponCode?: string;
  paymentMethod: "COD" | "RAZORPAY";
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponId?: string;
  couponError?: string;
}

export async function calculateOrderTotals(
  items: CartLineItemInput[],
  options: { couponCode?: string; deliverySlotId?: string } = {},
): Promise<OrderTotals> {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  let couponId: string | undefined;
  let couponError: string | undefined;

  if (options.couponCode) {
    const coupon = await findActiveCouponByCode(options.couponCode);

    if (!coupon) {
      couponError = "Invalid or expired coupon code.";
    } else if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      couponError = `Add ₹${coupon.minOrderValue - subtotal} more to use this coupon.`;
    } else if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      couponError = "This coupon has reached its usage limit.";
    } else if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      couponError = "This coupon has expired.";
    } else {
      discount =
        coupon.discountType === "PERCENT"
          ? Math.round((subtotal * coupon.discountValue) / 100)
          : coupon.discountValue;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      couponId = coupon.id;
    }
  }

  let deliveryCharge = subtotal - discount >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_CHARGE;

  if (options.deliverySlotId) {
    const slot = await findDeliverySlotById(options.deliverySlotId);
    if (slot) deliveryCharge += slot.extraCharge;
  }

  const total = subtotal - discount + deliveryCharge;

  return { subtotal, discount, deliveryCharge, total, couponId, couponError };
}

function generateOrderNumber(): string {
  return `SNF${Date.now().toString(36).toUpperCase()}`;
}

/** Validates the coupon/totals, creates the Order + OrderItems, and bumps coupon usage. Throws on a coupon error so the caller can surface it. */
export async function placeOrder(input: PlaceOrderInput) {
  const totals = await calculateOrderTotals(input.items, {
    couponCode: input.couponCode,
    deliverySlotId: input.deliverySlotId,
  });

  if (totals.couponError) {
    throw new Error(totals.couponError);
  }

  const orderItems: CreateOrderItemInput[] = input.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    productTitle: item.productTitle,
    variantLabel: item.variantLabel,
    imageUrl: item.imageUrl,
    unitPrice: item.price,
    quantity: item.quantity,
    lineTotal: item.price * item.quantity,
  }));

  const order = await createOrderRow({
    orderNumber: generateOrderNumber(),
    userId: input.userId,
    subtotal: totals.subtotal,
    discount: totals.discount,
    deliveryCharge: totals.deliveryCharge,
    total: totals.total,
    paymentMethod: input.paymentMethod,
    recipientName: input.recipientName,
    recipientPhone: input.recipientPhone,
    deliveryLine1: input.deliveryLine1,
    deliveryLine2: input.deliveryLine2,
    deliveryCity: input.deliveryCity,
    deliveryState: input.deliveryState,
    deliveryPincode: input.deliveryPincode,
    deliveryDate: input.deliveryDate,
    deliverySlotId: input.deliverySlotId,
    messageCard: input.messageCard,
    giftWrap: input.giftWrap,
    couponId: totals.couponId,
    items: orderItems,
  });

  if (totals.couponId) {
    await incrementCouponUsage(totals.couponId);
  }

  return order;
}
