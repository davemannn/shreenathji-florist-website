"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createCoupon as createCouponRepo,
  deleteCoupon as deleteCouponRepo,
  findCouponById,
  setCouponActive,
  updateCoupon as updateCouponRepo,
} from "@/server/repositories/coupon.repository";
import { couponFormSchema, type CouponFormValues } from "./validations";

function toRepoInput(values: CouponFormValues) {
  return { ...values, expiresAt: values.expiresAt ? new Date(values.expiresAt) : undefined };
}

export async function createCouponAction(input: CouponFormValues) {
  const session = await requireAdminCapability("coupons:manage");
  const values = couponFormSchema.parse(input);
  const coupon = await createCouponRepo(toRepoInput(values));

  await logAudit(session, {
    entityType: "Coupon",
    entityId: coupon.id,
    entityLabel: coupon.code,
    action: "created",
    summary: `Created (${values.discountType === "PERCENT" ? `${values.discountValue}%` : `₹${values.discountValue}`})`,
  });

  revalidatePath("/admin/coupons");
  return { id: coupon.id };
}

export async function updateCouponAction(id: string, input: CouponFormValues) {
  const session = await requireAdminCapability("coupons:manage");
  const values = couponFormSchema.parse(input);

  const before = await findCouponById(id);
  await updateCouponRepo(id, toRepoInput(values));

  if (before) {
    const changes: string[] = [];
    if (before.discountValue !== values.discountValue) {
      changes.push(`Value ${before.discountValue} → ${values.discountValue}`);
    }
    if (before.isActive !== values.isActive)
      changes.push(values.isActive ? "Reactivated" : "Deactivated");
    await logAudit(session, {
      entityType: "Coupon",
      entityId: id,
      entityLabel: values.code,
      action: "updated",
      summary: changes.length > 0 ? changes.join("; ") : "Updated coupon details",
    });
  }

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${id}`);
}

export async function setCouponActiveAction(id: string, isActive: boolean) {
  const session = await requireAdminCapability("coupons:manage");
  const coupon = await setCouponActive(id, isActive);

  await logAudit(session, {
    entityType: "Coupon",
    entityId: id,
    entityLabel: coupon.code,
    action: isActive ? "restored" : "archived",
    summary: isActive ? "Reactivated" : "Deactivated",
  });

  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(id: string) {
  const session = await requireAdminCapability("coupons:manage");
  const coupon = await findCouponById(id);
  await deleteCouponRepo(id);

  if (coupon) {
    await logAudit(session, {
      entityType: "Coupon",
      entityId: id,
      entityLabel: coupon.code,
      action: "deleted",
      summary: "Permanently deleted",
    });
  }

  revalidatePath("/admin/coupons");
}
