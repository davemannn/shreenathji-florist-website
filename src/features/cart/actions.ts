"use server";

import { calculateOrderTotals } from "@/server/services/order.service";

export interface CouponResult {
  valid: boolean;
  code: string;
  discount: number;
  error?: string;
}

/** Validates a coupon against the current cart subtotal — reuses the exact same logic checkout will use, so the discount shown here never drifts from what's actually charged. */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const totals = await calculateOrderTotals(subtotal, { couponCode: code });

  if (totals.couponError) {
    return { valid: false, code, discount: 0, error: totals.couponError };
  }

  return { valid: true, code: code.toUpperCase(), discount: totals.discount };
}
