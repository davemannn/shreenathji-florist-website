import {
  findCouponById,
  listCouponsAdmin as listCouponsAdminRepo,
} from "@/server/repositories/coupon.repository";
import type { AdminCoupon } from "./types";

type CouponRow = Awaited<ReturnType<typeof listCouponsAdminRepo>>[number];

function toAdminCoupon(coupon: CouponRow): AdminCoupon {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description ?? undefined,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minOrderValue: coupon.minOrderValue ?? undefined,
    maxDiscount: coupon.maxDiscount ?? undefined,
    expiresAt: coupon.expiresAt?.toISOString(),
    isActive: coupon.isActive,
    usageLimit: coupon.usageLimit ?? undefined,
    usedCount: coupon.usedCount,
  };
}

export async function listCouponsAdmin(): Promise<AdminCoupon[]> {
  const coupons = await listCouponsAdminRepo();
  return coupons.map(toAdminCoupon);
}

export async function getCouponForEdit(id: string): Promise<AdminCoupon | null> {
  const coupon = await findCouponById(id);
  return coupon ? toAdminCoupon(coupon) : null;
}
