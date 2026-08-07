"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  createProduct as createProductRepo,
  setProductActive,
  updateProduct as updateProductRepo,
} from "@/server/repositories/product.repository";
import { productFormSchema, type ProductFormValues } from "./validations";

export async function createProductAction(input: ProductFormValues) {
  await requireAdminCapability("products:manage");
  const values = productFormSchema.parse(input);

  const product = await createProductRepo(values);

  revalidatePath("/admin/products");
  return { id: product.id };
}

export async function updateProductAction(id: string, input: ProductFormValues) {
  await requireAdminCapability("products:manage");
  const values = productFormSchema.parse(input);

  await updateProductRepo(id, values);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  // Storefront pages showing this product need to reflect the edit too.
  revalidatePath(`/shop/product/${values.slug}`);
}

export async function setProductActiveAction(id: string, isActive: boolean) {
  await requireAdminCapability("products:manage");
  await setProductActive(id, isActive);
  revalidatePath("/admin/products");
}
