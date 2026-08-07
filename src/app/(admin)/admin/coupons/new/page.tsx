import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { CouponForm } from "@/features/coupon/components/coupon-form";

export const metadata: Metadata = {
  title: "New Coupon",
};

export default async function NewCouponPage() {
  await requireAdminSession("coupons:manage");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Coupon</h1>
      <CouponForm />
    </div>
  );
}
