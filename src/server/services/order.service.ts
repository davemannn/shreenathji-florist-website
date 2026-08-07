import {
  createOrder as createOrderRow,
  type CreateOrderItemInput,
} from "@/server/repositories/order.repository";
import {
  findActiveCouponByCode,
  incrementCouponUsage,
} from "@/server/repositories/coupon.repository";
import { findDeliverySlotById } from "@/server/repositories/delivery-slot.repository";
import { findProductsTaxInfo } from "@/server/repositories/product.repository";
import { getStoreSettings } from "@/features/settings/queries";
import { effectiveSlotCharge, isSlotAvailable, toIsoDate } from "@/lib/delivery";
import { isInterStateOrder, resolveProductTax, splitGst, splitInclusiveTax } from "@/lib/tax";

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

/**
 * Takes `subtotal` directly (rather than `items`) so the cart page can reuse
 * this for coupon validation before checkout even exists — no synthetic
 * cart items needed.
 */
export async function calculateOrderTotals(
  subtotal: number,
  options: { couponCode?: string; deliverySlotId?: string; deliveryDate?: Date } = {},
): Promise<OrderTotals> {
  const settings = await getStoreSettings();

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

  let deliveryCharge =
    subtotal - discount >= settings.freeDeliveryThreshold ? 0 : settings.baseDeliveryCharge;

  if (options.deliverySlotId) {
    const slot = await findDeliverySlotById(options.deliverySlotId);
    if (slot) {
      // Express/Instant always means "today" regardless of what date was
      // submitted (the client resets it, but never trust that alone).
      const dateIso =
        slot.type === "FIXED" ? toIsoDate() : toIsoDate(options.deliveryDate ?? new Date());

      if (!isSlotAvailable(slot.type, dateIso, undefined, settings.midnightCutoffHour)) {
        throw new Error("The selected delivery slot is no longer available for this date.");
      }

      deliveryCharge += effectiveSlotCharge(
        slot.type,
        dateIso,
        slot.extraCharge,
        undefined,
        settings.midnightCutoffHour,
        settings.midnightCharge,
      );
    }
  }

  const total = subtotal - discount + deliveryCharge;

  return { subtotal, discount, deliveryCharge, total, couponId, couponError };
}

function generateOrderNumber(): string {
  return `SNF${Date.now().toString(36).toUpperCase()}`;
}

/** Validates the coupon/totals, creates the Order + OrderItems, and bumps coupon usage. Throws on a coupon error so the caller can surface it. */
export async function placeOrder(input: PlaceOrderInput) {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totals = await calculateOrderTotals(subtotal, {
    couponCode: input.couponCode,
    deliverySlotId: input.deliverySlotId,
    deliveryDate: input.deliveryDate,
  });

  if (totals.couponError) {
    throw new Error(totals.couponError);
  }

  const settings = await getStoreSettings();
  const isInterState = isInterStateOrder(input.deliveryState, settings.registeredState);
  const taxInfoByProduct = await findProductsTaxInfo(input.items.map((item) => item.productId));

  // A coupon discount reduces each line's taxable value proportionally, so
  // the invoice's tax figures shrink consistently with what the customer
  // actually paid rather than taxing value they got a discount on.
  const discountRatio = subtotal > 0 ? totals.discount / subtotal : 0;

  let orderTaxableValue = 0;
  let orderTaxAmount = 0;

  const orderItems: CreateOrderItemInput[] = input.items.map((item) => {
    const categories = taxInfoByProduct.get(item.productId) ?? [];
    const { gstRate, hsnCode } = resolveProductTax(categories, settings.defaultGstRate);
    const lineTotal = item.price * item.quantity;
    const discountedLineTotal = Math.round(lineTotal * (1 - discountRatio));
    const { taxableValue, taxAmount } = splitInclusiveTax(discountedLineTotal, gstRate);
    orderTaxableValue += taxableValue;
    orderTaxAmount += taxAmount;

    return {
      productId: item.productId,
      variantId: item.variantId,
      productTitle: item.productTitle,
      variantLabel: item.variantLabel,
      imageUrl: item.imageUrl,
      unitPrice: item.price,
      quantity: item.quantity,
      lineTotal,
      gstRate,
      hsnCode: hsnCode ?? undefined,
      taxableValue,
      taxAmount,
    };
  });

  // Delivery charge is taxed too (at the storewide default rate) — its tax
  // isn't attributed to any single line item, only to the order-level
  // totals below.
  const deliveryTax = splitInclusiveTax(totals.deliveryCharge, settings.defaultGstRate);
  orderTaxableValue += deliveryTax.taxableValue;
  orderTaxAmount += deliveryTax.taxAmount;

  const { cgstAmount, sgstAmount, igstAmount } = splitGst(orderTaxAmount, isInterState);

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
    sellerGstin: settings.gstin ?? undefined,
    sellerState: settings.registeredState,
    isInterState,
    taxableValue: orderTaxableValue,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax: orderTaxAmount,
    items: orderItems,
  });

  if (totals.couponId) {
    await incrementCouponUsage(totals.couponId);
  }

  return order;
}
