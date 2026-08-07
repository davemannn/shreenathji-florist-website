"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  createCoupon as createCouponRepo,
  deleteCoupon as deleteCouponRepo,
  updateCoupon as updateCouponRepo,
} from "@/server/repositories/coupon.repository";
import { couponFormSchema, type CouponFormValues } from "./validations";

function toRepoInput(values: CouponFormValues) {
  return { ...values, expiresAt: values.expiresAt ? new Date(values.expiresAt) : undefined };
}

export async function createCouponAction(input: CouponFormValues) {
  await requireAdminCapability("coupons:manage");
  const values = couponFormSchema.parse(input);
  const coupon = await createCouponRepo(toRepoInput(values));
  revalidatePath("/admin/coupons");
  return { id: coupon.id };
}

export async function updateCouponAction(id: string, input: CouponFormValues) {
  await requireAdminCapability("coupons:manage");
  const values = couponFormSchema.parse(input);
  await updateCouponRepo(id, toRepoInput(values));
  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${id}`);
}

export async function deleteCouponAction(id: string) {
  await requireAdminCapability("coupons:manage");
  await deleteCouponRepo(id);
  revalidatePath("/admin/coupons");
}
