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

export async function createCategoryAction(input: CategoryFormValues) {
  await requireAdminCapability("categories:manage");
  const values = categoryFormSchema.parse(input);

  const category = await createCategoryRepo(values);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { id: category.id };
}

export async function updateCategoryAction(id: string, input: CategoryFormValues) {
  await requireAdminCapability("categories:manage");
  const values = categoryFormSchema.parse(input);

  await updateCategoryRepo(id, values);

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
