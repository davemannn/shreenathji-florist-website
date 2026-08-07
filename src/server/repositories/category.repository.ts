import { prisma } from "@/server/db/prisma";

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function listFeaturedCategories() {
  return prisma.category.findMany({
    where: { isFeatured: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

// ---------------------------------------------------------------------------
// Admin panel — catalog management (Phase 3).
// ---------------------------------------------------------------------------

export async function findCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export interface UpsertCategoryInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageCloudinaryId?: string;
  isOccasion: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export async function createCategory(input: UpsertCategoryInput) {
  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: UpsertCategoryInput) {
  return prisma.category.update({ where: { id }, data: input });
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
