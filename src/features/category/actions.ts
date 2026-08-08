"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createCategory as createCategoryRepo,
  deleteCategory as deleteCategoryRepo,
  findCategoryById,
  reorderCategories as reorderCategoriesRepo,
  setCategoryArchived,
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
  const session = await requireAdminCapability("categories:manage");
  const values = categoryFormSchema.parse(input);

  const category = await createCategoryRepo(toRepoInput(values));

  await logAudit(session, {
    entityType: "Category",
    entityId: category.id,
    entityLabel: values.name,
    action: "created",
    summary: "Created",
  });

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { id: category.id };
}

export async function updateCategoryAction(id: string, input: CategoryFormValues) {
  const session = await requireAdminCapability("categories:manage");
  const values = categoryFormSchema.parse(input);

  const before = await findCategoryById(id);
  await updateCategoryRepo(id, toRepoInput(values));

  if (before) {
    const changes: string[] = [];
    if (before.name !== values.name) changes.push(`Name "${before.name}" → "${values.name}"`);
    if (before.gstRate !== (values.gstRate ?? null)) {
      changes.push(`GST rate ${before.gstRate ?? "unset"}% → ${values.gstRate ?? "unset"}%`);
    }
    await logAudit(session, {
      entityType: "Category",
      entityId: id,
      entityLabel: values.name,
      action: "updated",
      summary: changes.length > 0 ? changes.join("; ") : "Updated category details",
    });
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/shop");
}

/** Hides from the storefront without touching its products — see Category.isArchived in schema.prisma. */
export async function setCategoryArchivedAction(id: string, isArchived: boolean) {
  const session = await requireAdminCapability("categories:manage");
  const category = await setCategoryArchived(id, isArchived);

  await logAudit(session, {
    entityType: "Category",
    entityId: id,
    entityLabel: category.name,
    action: isArchived ? "archived" : "restored",
    summary: isArchived ? "Archived" : "Restored from archive",
  });

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function deleteCategoryAction(id: string) {
  const session = await requireAdminCapability("categories:manage");
  const category = await findCategoryById(id);
  await deleteCategoryRepo(id);

  if (category) {
    await logAudit(session, {
      entityType: "Category",
      entityId: id,
      entityLabel: category.name,
      action: "deleted",
      summary: "Permanently deleted",
    });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  await requireAdminCapability("categories:manage");
  await reorderCategoriesRepo(orderedIds);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}
