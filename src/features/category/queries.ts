import type { Category } from "./types";

const FEATURED_CATEGORIES: Category[] = [
  { id: "1", name: "Bouquets", slug: "bouquets", imageAlt: "Bouquets" },
  { id: "2", name: "Birthday", slug: "birthday", imageAlt: "Birthday flowers" },
  { id: "3", name: "Anniversary", slug: "anniversary", imageAlt: "Anniversary flowers" },
  { id: "4", name: "Plants", slug: "plants", imageAlt: "Indoor plants" },
  { id: "5", name: "Cakes", slug: "cakes", imageAlt: "Cakes" },
  { id: "6", name: "Sympathy", slug: "sympathy", imageAlt: "Sympathy flowers" },
];

export async function getFeaturedCategories(): Promise<Category[]> {
  // TODO(prisma-milestone): return prisma.category.findMany({ where: { featured: true } });
  return FEATURED_CATEGORIES;
}
