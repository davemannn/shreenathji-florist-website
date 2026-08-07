import {
  countProductsInCategory,
  findCategoryById,
  findCategoryBySlug,
  listCategories as listCategoriesRepo,
  listFeaturedCategories,
} from "@/server/repositories/category.repository";
import type { AdminCategory, Category } from "./types";

type CategoryRow = Awaited<ReturnType<typeof listFeaturedCategories>>[number];

function toCategory(category: CategoryRow): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    imageAlt: category.name,
    imageUrl: category.imageUrl ?? undefined,
  };
}

export async function getFeaturedCategories(): Promise<Category[]> {
  const categories = await listFeaturedCategories();
  return categories.map(toCategory);
}

export async function listAllCategories(): Promise<Category[]> {
  const categories = await listCategoriesRepo();
  return categories.map(toCategory);
}

export interface CategoryWithMeta extends Category {
  description?: string;
  isOccasion: boolean;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithMeta | null> {
  const category = await findCategoryBySlug(slug);
  if (!category) return null;

  return {
    ...toCategory(category),
    description: category.description ?? undefined,
    isOccasion: category.isOccasion,
  };
}

// ---------------------------------------------------------------------------
// Admin panel — catalog management (Phase 3).
// ---------------------------------------------------------------------------

export async function listCategoriesAdmin(): Promise<AdminCategory[]> {
  const categories = await listCategoriesRepo();
  return Promise.all(
    categories.map(async (category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? undefined,
      imageUrl: category.imageUrl ?? undefined,
      imageCloudinaryId: category.imageCloudinaryId ?? undefined,
      isOccasion: category.isOccasion,
      isFeatured: category.isFeatured,
      sortOrder: category.sortOrder,
      productCount: await countProductsInCategory(category.id),
    })),
  );
}

export async function getCategoryForEdit(id: string): Promise<AdminCategory | null> {
  const category = await findCategoryById(id);
  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
    imageUrl: category.imageUrl ?? undefined,
    imageCloudinaryId: category.imageCloudinaryId ?? undefined,
    isOccasion: category.isOccasion,
    isFeatured: category.isFeatured,
    sortOrder: category.sortOrder,
    productCount: await countProductsInCategory(category.id),
  };
}
