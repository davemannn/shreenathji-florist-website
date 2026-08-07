import { prisma } from "@/server/db/prisma";

export async function findActiveCouponByCode(code: string) {
  return prisma.coupon.findFirst({
    where: { code: code.toUpperCase(), isActive: true },
  });
}

export async function incrementCouponUsage(couponId: string) {
  return prisma.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}

// ---------------------------------------------------------------------------
// Admin panel — marketing/content management (Phase 4).
// ---------------------------------------------------------------------------

export async function listCouponsAdmin() {
  return prisma.coupon.findMany({ orderBy: { id: "desc" } });
}

export async function findCouponById(id: string) {
  return prisma.coupon.findUnique({ where: { id } });
}

export interface UpsertCouponInput {
  code: string;
  description?: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  isActive: boolean;
  usageLimit?: number;
}

export async function createCoupon(input: UpsertCouponInput) {
  return prisma.coupon.create({ data: { ...input, code: input.code.toUpperCase() } });
}

export async function updateCoupon(id: string, input: UpsertCouponInput) {
  return prisma.coupon.update({
    where: { id },
    data: { ...input, code: input.code.toUpperCase() },
  });
}

/**
 * Coupons referenced by real orders (Order.couponId, onDelete: SetNull) hard
 * delete safely — the order snapshots its own discount amount already, so
 * losing the Coupon row afterwards doesn't corrupt order history. Still,
 * deactivating (isActive: false) is the normal way to retire a code; delete
 * is for cleaning up ones created by mistake.
 */
export async function deleteCoupon(id: string) {
  return prisma.coupon.delete({ where: { id } });
}
