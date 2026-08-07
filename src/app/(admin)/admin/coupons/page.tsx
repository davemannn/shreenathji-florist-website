import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listCouponsAdmin } from "@/features/coupon/queries";
import { CouponsTable } from "@/features/coupon/components/coupons-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Coupons",
};

export default async function AdminCouponsPage() {
  await requireAdminSession("coupons:manage");
  const coupons = await listCouponsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Coupons</h1>
          <p className="text-muted-foreground text-sm">{coupons.length} coupons</p>
        </div>
        <Button variant="brand" nativeButton={false} render={<Link href="/admin/coupons/new" />}>
          <Plus className="size-4" aria-hidden="true" />
          New Coupon
        </Button>
      </div>

      <CouponsTable coupons={coupons} />
    </div>
  );
}
