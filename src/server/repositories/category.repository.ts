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
