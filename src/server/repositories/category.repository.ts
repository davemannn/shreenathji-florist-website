import { prisma } from "@/server/db/prisma";

/** Storefront-facing — archived categories (Category.isArchived) never appear here. */
export async function listCategories() {
  return prisma.category.findMany({ where: { isArchived: false }, orderBy: { sortOrder: "asc" } });
}

export async function listFeaturedCategories() {
  return prisma.category.findMany({
    where: { isFeatured: true, isArchived: false },
    orderBy: { sortOrder: "asc" },
  });
}

/** Storefront-facing — an archived category's page 404s like it doesn't exist. */
export async function findCategoryBySlug(slug: string) {
  return prisma.category.findFirst({ where: { slug, isArchived: false } });
}

// ---------------------------------------------------------------------------
// Admin panel — catalog management (Phase 3).
// ---------------------------------------------------------------------------

export async function findCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export interface ListCategoriesAdminParams {
  search?: string;
}

/**
 * Includes `_count.products` instead of the caller running a separate
 * `countProductsInCategory` query per row — this used to be an N+1
 * (`Promise.all` over every category) before the admin list needed to sort
 * by product count too.
 */
export async function listCategoriesAdmin(params: ListCategoriesAdminParams = {}) {
  const { search } = params;
  const where = search ? { name: { contains: search } } : {};
  return prisma.category.findMany({
    where,
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" as const },
  });
}

export interface UpsertCategoryInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageCloudinaryId?: string;
  isOccasion: boolean;
  isFeatured: boolean;
  gstRate?: number | null;
  hsnCode?: string | null;
}

/**
 * New categories land at the end of the sort order automatically — the
 * admin reorders visually via drag-and-drop afterwards (reorderCategories
 * below) rather than typing a raw sortOrder number.
 */
export async function createCategory(input: UpsertCategoryInput) {
  const last = await prisma.category.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.category.create({ data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 } });
}

export async function updateCategory(id: string, input: UpsertCategoryInput) {
  return prisma.category.update({ where: { id }, data: input });
}

export async function setCategoryArchived(id: string, isArchived: boolean) {
  return prisma.category.update({ where: { id }, data: { isArchived } });
}

/** Persists a full reorder — `orderedIds` is the complete new top-to-bottom order. */
export async function reorderCategories(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
}

/**
 * ProductCategory rows cascade-delete (onDelete: Cascade) — this only ever
 * removes the category-product associations, never the products themselves.
 * Safe to hard-delete, unlike products (which use a soft isActive toggle
 * because they carry real order history).
 */
export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export async function countProductsInCategory(id: string) {
  return prisma.productCategory.count({ where: { categoryId: id } });
}
