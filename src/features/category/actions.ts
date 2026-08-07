"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  createCategory as createCategoryRepo,
  deleteCategory as deleteCategoryRepo,
  reorderCategories as reorderCategoriesRepo,
  updateCategory as updateCategoryRepo,
} from "@/server/repositories/category.repository";
import { categoryFormSchema, type CategoryFormValues } from "./validations";

// gstRate/hsnCode: undefined means "leave unchanged" to Prisma's update
// input, which is wrong for a field the admin explicitly cleared — coerce
// to null so clearing the rate/HSN in the form actually clears it in the DB.
function toRepoInput(values: CategoryFormValues) {
  return { ...values, gstRate: values.gstRate ?? null, hsnCode: values.hsnCode || null };
}

export async function createCategoryAction(input: CategoryFormValues) {
  await requireAdminCapability("categories:manage");
  const values = categoryFormSchema.parse(input);

  const category = await createCategoryRepo(toRepoInput(values));

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { id: category.id };
}

export async function updateCategoryAction(id: string, input: CategoryFormValues) {
  await requireAdminCapability("categories:manage");
  const values = categoryFormSchema.parse(input);

  await updateCategoryRepo(id, toRepoInput(values));

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/shop");
}

export async function deleteCategoryAction(id: string) {
  await requireAdminCapability("categories:manage");
  await deleteCategoryRepo(id);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  await requireAdminCapability("categories:manage");
  await reorderCategoriesRepo(orderedIds);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}
