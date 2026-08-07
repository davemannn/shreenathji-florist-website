import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getCouponForEdit } from "@/features/coupon/queries";
import { CouponForm } from "@/features/coupon/components/coupon-form";

export const metadata: Metadata = {
  title: "Edit Coupon",
};

export default async function EditCouponPage({ params }: PageProps<"/admin/coupons/[id]">) {
  const { id } = await params;
  await requireAdminSession("coupons:manage");

  const coupon = await getCouponForEdit(id);
  if (!coupon) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Coupon</h1>
      <CouponForm coupon={coupon} />
    </div>
  );
}
