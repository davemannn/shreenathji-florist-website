import {
  findBestSellers,
  findProductByIdAdmin,
  findProductBySlug,
  findRelatedProducts,
  listProducts as listProductsRepo,
  listProductsAdmin as listProductsAdminRepo,
  searchProducts as searchProductsRepo,
  type ListProductsAdminParams,
  type ListProductsParams,
  type SearchProductsParams,
} from "@/server/repositories/product.repository";
import type { AdminProductDetail, AdminProductListItem, Product, ProductDetail } from "./types";

// Prisma's generated types are structurally wide enough that we don't need
// to import them explicitly here — these mapper functions just need
// whatever shape the repository's `include` actually returns.
type ProductWithRelations = NonNullable<Awaited<ReturnType<typeof findProductBySlug>>>;
type ProductListRow = Awaited<ReturnType<typeof findBestSellers>>[number];
type ProductAdminRow = NonNullable<Awaited<ReturnType<typeof findProductByIdAdmin>>>;

function defaultVariant<T extends ProductListRow>(product: T) {
  return product.variants.find((v) => v.isDefault) ?? product.variants[0];
}

function toProductCard(product: ProductListRow): Product {
  const variant = defaultVariant(product);
  const primaryImage = product.images[0];

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: variant?.price ?? 0,
    compareAtPrice: variant?.compareAtPrice ?? undefined,
    defaultVariantId: variant?.id ?? "",
    defaultVariantLabel: variant?.label ?? "",
    rating: product.rating,
    reviewCount: product.reviewCount,
    badge: product.badge?.toLowerCase() as Product["badge"],
    imageAlt: primaryImage?.alt ?? product.title,
    imageUrl: primaryImage?.url,
  };
}

function toProductDetail(product: ProductWithRelations): ProductDetail {
  return {
    ...toProductCard(product),
    description: product.description,
    images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? undefined,
      stock: variant.stock,
      isDefault: variant.isDefault,
      imageUrl: variant.imageUrl ?? undefined,
    })),
    reviews: product.reviews.map((review) => ({
      id: review.id,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    })),
    categorySlugs: product.categories.map((pc) => pc.category.slug),
  };
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const products = await findBestSellers(limit);
  return products.map(toProductCard);
}

export type ShopProductListParams = ListProductsParams;

export interface ShopProductListResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listShopProducts(
  params: ShopProductListParams = {},
): Promise<ShopProductListResult> {
  const { products, total, page, pageSize } = await listProductsRepo(params);
  let mapped = products.map(toProductCard);

  // price-asc/price-desc sort at the application layer — see the repository
  // for why (ordering a parent by a nested aggregate isn't a plain Prisma query).
  if (params.sort === "price-asc") mapped = mapped.sort((a, b) => a.price - b.price);
  if (params.sort === "price-desc") mapped = mapped.sort((a, b) => b.price - a.price);

  return { products: mapped, total, page, pageSize };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await findProductBySlug(slug);
  return product ? toProductDetail(product) : null;
}

export type ProductSearchParams = SearchProductsParams;

export async function searchShopProducts(
  params: ProductSearchParams,
): Promise<ShopProductListResult> {
  const { products, total, page, pageSize } = await searchProductsRepo(params);
  return { products: products.map(toProductCard), total, page, pageSize };
}

export async function getRelatedProducts(
  productId: string,
  categorySlugs: string[],
  limit = 4,
): Promise<Product[]> {
  const products = await findRelatedProducts(productId, categorySlugs, limit);
  return products.map(toProductCard);
}

// ---------------------------------------------------------------------------
// Admin panel — catalog management (Phase 3).
// ---------------------------------------------------------------------------

function toAdminListItem(product: ProductListRow): AdminProductListItem {
  const primaryImage = product.images[0];
  const prices = product.variants.map((v) => v.price);
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    isActive: product.isActive,
    isBestSeller: product.isBestSeller,
    isFeatured: product.isFeatured,
    badge: product.badge ?? undefined,
    imageUrl: primaryImage?.url,
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
    categoryNames: product.categories.map((pc) => pc.category.name),
  };
}

function toAdminDetail(product: ProductAdminRow): AdminProductDetail {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    badge: product.badge ?? undefined,
    isActive: product.isActive,
    isBestSeller: product.isBestSeller,
    isFeatured: product.isFeatured,
    categoryIds: product.categories.map((pc) => pc.categoryId),
    variants: product.variants.map((v) => ({
      label: v.label,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? undefined,
      stock: v.stock,
      isDefault: v.isDefault,
      imageUrl: v.imageUrl ?? undefined,
      imageCloudinaryId: v.imageCloudinaryId ?? undefined,
    })),
    images: product.images.map((img) => ({
      url: img.url,
      alt: img.alt,
      cloudinaryId: img.cloudinaryId ?? undefined,
    })),
  };
}

export type AdminProductSort = "title" | "price" | "stock" | "status";

export interface AdminProductListQueryParams extends ListProductsAdminParams {
  sort?: AdminProductSort;
  dir?: "asc" | "desc";
}

export interface AdminProductListResult {
  products: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listProductsAdmin(
  params: AdminProductListQueryParams = {},
): Promise<AdminProductListResult> {
  const { sort, dir = "asc", page = 1, pageSize = 20, ...repoParams } = params;
  const products = await listProductsAdminRepo(repoParams);
  const mapped = products.map(toAdminListItem);

  const factor = dir === "desc" ? -1 : 1;
  if (sort === "title") mapped.sort((a, b) => factor * a.title.localeCompare(b.title));
  if (sort === "price") mapped.sort((a, b) => factor * (a.minPrice - b.minPrice));
  if (sort === "stock") mapped.sort((a, b) => factor * (a.totalStock - b.totalStock));
  if (sort === "status") mapped.sort((a, b) => factor * (Number(a.isActive) - Number(b.isActive)));

  const total = mapped.length;
  const start = (page - 1) * pageSize;
  return { products: mapped.slice(start, start + pageSize), total, page, pageSize };
}

export async function getProductForEdit(id: string): Promise<AdminProductDetail | null> {
  const product = await findProductByIdAdmin(id);
  return product ? toAdminDetail(product) : null;
}
