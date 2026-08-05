import {
  findBestSellers,
  findProductBySlug,
  findRelatedProducts,
  listProducts as listProductsRepo,
  type ListProductsParams,
} from "@/server/repositories/product.repository";
import type { Product, ProductDetail } from "./types";

// Prisma's generated types are structurally wide enough that we don't need
// to import them explicitly here — these mapper functions just need
// whatever shape the repository's `include` actually returns.
type ProductWithRelations = NonNullable<Awaited<ReturnType<typeof findProductBySlug>>>;
type ProductListRow = Awaited<ReturnType<typeof findBestSellers>>[number];

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

export async function getRelatedProducts(
  productId: string,
  categorySlugs: string[],
  limit = 4,
): Promise<Product[]> {
  const products = await findRelatedProducts(productId, categorySlugs, limit);
  return products.map(toProductCard);
}
