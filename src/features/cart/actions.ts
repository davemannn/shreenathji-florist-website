"use server";

import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import { calculateOrderTotals } from "@/server/services/order.service";
import {
  deleteCartSnapshot,
  upsertCartSnapshot,
} from "@/server/repositories/cart-snapshot.repository";
import { syncCartSnapshotSchema, type SyncCartSnapshotInput } from "./validations";

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

/**
 * Fire-and-forget sync from the client cart store — only tracks signed-in
 * users' carts (guest carts have no stable identity to email a reminder to,
 * and the RBAC plan's abandoned-cart scope was deliberately limited to
 * this). Silently no-ops for a signed-out visitor rather than erroring, so
 * the calling hook doesn't need to know or care whether anyone's signed in.
 */
export async function syncCartSnapshotAction(input: SyncCartSnapshotInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;

  const values = syncCartSnapshotSchema.parse(input);
  if (values.items.length === 0) {
    await deleteCartSnapshot(session.user.id);
    return;
  }

  await upsertCartSnapshot(session.user.id, values.items, values.subtotal);
}
