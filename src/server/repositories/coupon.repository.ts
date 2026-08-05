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
