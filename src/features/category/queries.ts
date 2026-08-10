import {
  countProductsInCategory,
  findCategoryById,
  findCategoryBySlug,
  listCategories as listCategoriesRepo,
  listCategoriesAdmin as listCategoriesAdminRepo,
  listFeaturedCategories,
  type ListCategoriesAdminParams,
} from "@/server/repositories/category.repository";
import type { NavCategoryGroups } from "@/config/navigation";
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

/** Feeds the header's "Shop"/"Occasions"/"Gifts For" dropdown children — see buildMainNav. */
export async function getNavCategoryGroups(): Promise<NavCategoryGroups> {
  const categories = await listCategoriesRepo();
  const toNavItem = (category: CategoryRow) => ({
    label: category.name,
    href: `/shop/${category.slug}`,
  });
  return {
    shop: categories.filter((c) => !c.isOccasion && !c.isRecipient).map(toNavItem),
    occasions: categories.filter((c) => c.isOccasion).map(toNavItem),
    recipients: categories.filter((c) => c.isRecipient).map(toNavItem),
  };
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

export type AdminCategorySort = "name" | "products" | "flags";

export interface ListCategoriesAdminQueryParams extends ListCategoriesAdminParams {
  sort?: AdminCategorySort;
  dir?: "asc" | "desc";
}

/**
 * Sorted in the application layer, same reasoning as the product admin list
 * (see product/queries.ts) — this is a single florist's catalog (a handful
 * of categories), not worth a second DB round trip per sort key.
 */
export async function listCategoriesAdmin(
  params: ListCategoriesAdminQueryParams = {},
): Promise<AdminCategory[]> {
  const { sort, dir = "asc", ...repoParams } = params;
  const categories = await listCategoriesAdminRepo(repoParams);
  const mapped = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
    imageUrl: category.imageUrl ?? undefined,
    imageCloudinaryId: category.imageCloudinaryId ?? undefined,
    isOccasion: category.isOccasion,
    isRecipient: category.isRecipient,
    isFeatured: category.isFeatured,
    isArchived: category.isArchived,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
    gstRate: category.gstRate ?? undefined,
    hsnCode: category.hsnCode ?? undefined,
  }));

  const factor = dir === "desc" ? -1 : 1;
  if (sort === "name") mapped.sort((a, b) => factor * a.name.localeCompare(b.name));
  if (sort === "products") mapped.sort((a, b) => factor * (a.productCount - b.productCount));
  if (sort === "flags")
    mapped.sort((a, b) => factor * (Number(a.isFeatured) - Number(b.isFeatured)));

  return mapped;
}

export interface AdminCategoryListResult {
  categories: AdminCategory[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Paginated wrapper around listCategoriesAdmin's full sorted list — kept
 * separate rather than folding page/pageSize into that function itself,
 * because the reorder dialog on /admin/categories still needs the *full*
 * ordered list regardless of which page the table is showing (see that
 * page's two parallel listCategoriesAdmin calls).
 */
export async function listCategoriesAdminPaginated(
  params: ListCategoriesAdminQueryParams & { page?: number; pageSize?: number } = {},
): Promise<AdminCategoryListResult> {
  const { page = 1, pageSize = 20, ...rest } = params;
  const all = await listCategoriesAdmin(rest);
  const total = all.length;
  const start = (page - 1) * pageSize;
  return { categories: all.slice(start, start + pageSize), total, page, pageSize };
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
    isRecipient: category.isRecipient,
    isFeatured: category.isFeatured,
    isArchived: category.isArchived,
    sortOrder: category.sortOrder,
    productCount: await countProductsInCategory(category.id),
    gstRate: category.gstRate ?? undefined,
    hsnCode: category.hsnCode ?? undefined,
  };
}
