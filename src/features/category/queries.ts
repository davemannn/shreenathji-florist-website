import {
  findCategoryBySlug,
  listCategories as listCategoriesRepo,
  listFeaturedCategories,
} from "@/server/repositories/category.repository";
import type { Category } from "./types";

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
