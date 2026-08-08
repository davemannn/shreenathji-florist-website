"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Power, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteCouponAction, setCouponActiveAction } from "../actions";
import type { AdminCoupon } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CouponsTable({ coupons }: { coupons: AdminCoupon[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(coupon: AdminCoupon) {
    startTransition(async () => {
      try {
        await setCouponActiveAction(coupon.id, !coupon.isActive);
        toast.success(coupon.isActive ? "Coupon deactivated." : "Coupon activated.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this coupon.");
      }
    });
  }

  function handleDelete(coupon: AdminCoupon) {
    if (
      !window.confirm(`Permanently delete coupon "${coupon.code}"? Consider deactivating instead.`)
    )
      return;
    startTransition(async () => {
      try {
        await deleteCouponAction(coupon.id);
        toast.success("Coupon deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this coupon.");
      }
    });
  }

  if (coupons.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No coupons yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => {
          const expired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;
          const exhausted = coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit;
          return (
            <TableRow key={coupon.id}>
              <TableCell>
                <Link
                  href={`/admin/coupons/${coupon.id}`}
                  className="text-brand font-medium hover:underline"
                >
                  {coupon.code}
                </Link>
                {coupon.description ? (
                  <p className="text-muted-foreground text-xs">{coupon.description}</p>
                ) : null}
              </TableCell>
              <TableCell>
                {coupon.discountType === "PERCENT"
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue}`}
                {coupon.maxDiscount ? (
                  <span className="text-muted-foreground"> (max ₹{coupon.maxDiscount})</span>
                ) : null}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {coupon.usedCount}
                {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""} used
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}
              </TableCell>
              <TableCell>
                {!coupon.isActive ? (
                  <Badge variant="outline">Inactive</Badge>
                ) : expired ? (
                  <Badge variant="outline">Expired</Badge>
                ) : exhausted ? (
                  <Badge variant="outline">Limit reached</Badge>
                ) : (
                  <Badge variant="secondary">Active</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/admin/coupons/${coupon.id}`} />}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleToggleActive(coupon)}
                  >
                    <Power className="size-3.5" aria-hidden="true" />
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => handleDelete(coupon)}
                    aria-label={`Permanently delete ${coupon.code}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
