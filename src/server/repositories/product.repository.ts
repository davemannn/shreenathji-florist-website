import { prisma } from "@/server/db/prisma";

export type ProductSort = "newest" | "price-asc" | "price-desc" | "rating";

export interface ListProductsParams {
  categorySlug?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

const PRODUCT_INCLUDE = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: { sortOrder: "asc" as const } },
  categories: { include: { category: true } },
};

function orderByFor(sort: ProductSort | undefined) {
  switch (sort) {
    case "rating":
      return { rating: "desc" as const };
    case "newest":
      return { createdAt: "desc" as const };
    // price-asc/price-desc sort by the cheapest variant's price at the
    // application layer (src/features/product/queries.ts) — Prisma can't
    // order a parent by an aggregate of its children in a single query
    // without raw SQL, which isn't worth it for this catalog's size.
    default:
      return { createdAt: "desc" as const };
  }
}

export async function listProducts(params: ListProductsParams = {}) {
  const { categorySlug, sort, page = 1, pageSize = 12 } = params;

  const where = {
    isActive: true,
    ...(categorySlug ? { categories: { some: { category: { slug: categorySlug } } } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: orderByFor(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, pageSize };
}

export async function findProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      ...PRODUCT_INCLUDE,
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" as const } },
    },
  });
}

export async function findBestSellers(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isBestSeller: true },
    include: PRODUCT_INCLUDE,
    orderBy: { rating: "desc" },
    take: limit,
  });
}

export interface SearchProductsParams {
  query: string;
  page?: number;
  pageSize?: number;
}

/** Plain `contains` match on title/description — MySQL's default collation
 * already makes this case-insensitive, no Postgres-only `mode: "insensitive"`
 * option needed. Fine for this catalog's size; a dedicated search index
 * would only be worth it at a much bigger scale. */
export async function searchProducts(params: SearchProductsParams) {
  const { query, page = 1, pageSize = 12 } = params;

  const where = {
    isActive: true,
    OR: [{ title: { contains: query } }, { description: { contains: query } }],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: { rating: "desc" as const },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, pageSize };
}

export async function findRelatedProducts(productId: string, categorySlugs: string[], limit = 4) {
  if (categorySlugs.length === 0) return [];

  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      categories: { some: { category: { slug: { in: categorySlugs } } } },
    },
    include: PRODUCT_INCLUDE,
    take: limit,
  });
}

// ---------------------------------------------------------------------------
// Admin panel — catalog management (Phase 3). Unlike the storefront queries
// above, these deliberately don't filter isActive=true — admin needs to see
// and manage deactivated products too.
// ---------------------------------------------------------------------------

export interface ListProductsAdminParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Returns every matching row, unpaginated — the admin product list sorts
 * (including by computed columns like price/stock, which Prisma can't
 * order by without raw SQL — see the price-sort comment above) and
 * paginates in the application layer instead. Fine at this catalog's size
 * (a single florist shop); see product/queries.ts.
 */
export async function listProductsAdmin(params: ListProductsAdminParams = {}) {
  const { search } = params;

  const where = search
    ? { OR: [{ title: { contains: search } }, { slug: { contains: search } }] }
    : {};

  return prisma.product.findMany({
    where,
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export async function findProductByIdAdmin(id: string) {
  return prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
}

export interface ProductVariantInput {
  label: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isDefault: boolean;
  imageUrl?: string;
  imageCloudinaryId?: string;
}

export interface ProductImageInput {
  url: string;
  alt: string;
  cloudinaryId?: string;
}

export interface UpsertProductInput {
  slug: string;
  title: string;
  description: string;
  badge?: "SALE" | "NEW" | "BESTSELLER" | null;
  isActive: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  categoryIds: string[];
  variants: ProductVariantInput[];
  images: ProductImageInput[];
}

/** Nested create — a new Product plus its categories/variants/images in one atomic write. */
export async function createProduct(input: UpsertProductInput) {
  const { categoryIds, variants, images, ...productData } = input;

  return prisma.product.create({
    data: {
      ...productData,
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      variants: { create: variants.map((v, sortOrder) => ({ ...v, sortOrder })) },
      images: { create: images.map((img, sortOrder) => ({ ...img, sortOrder })) },
    },
    include: PRODUCT_INCLUDE,
  });
}

/**
 * Variants/images/categories are fully replaced (delete + recreate) rather
 * than diffed — simpler, and safe: OrderItem.variantId/productId both use
 * onDelete: SetNull, so existing order history (which snapshots
 * productTitle/variantLabel/etc. already) is unaffected by a variant being
 * deleted out from under it. Same pattern the seed script already uses.
 */
export async function updateProduct(id: string, input: UpsertProductInput) {
  const { categoryIds, variants, images, ...productData } = input;

  return prisma.$transaction(async (tx) => {
    await tx.productCategory.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({ where: { productId: id } });
    await tx.productImage.deleteMany({ where: { productId: id } });

    return tx.product.update({
      where: { id },
      data: {
        ...productData,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        variants: { create: variants.map((v, sortOrder) => ({ ...v, sortOrder })) },
        images: { create: images.map((img, sortOrder) => ({ ...img, sortOrder })) },
      },
      include: PRODUCT_INCLUDE,
    });
  });
}

export async function setProductActive(id: string, isActive: boolean) {
  return prisma.product.update({ where: { id }, data: { isActive } });
}
