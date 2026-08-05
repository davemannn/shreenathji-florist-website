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
