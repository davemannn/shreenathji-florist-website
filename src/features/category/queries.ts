import { pexelsPhoto } from "@/lib/stock-photo";
import type { Category } from "./types";

const FEATURED_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Bouquets",
    slug: "bouquets",
    imageAlt: "Bouquets",
    imageUrl: pexelsPhoto("36171894", 400),
  },
  {
    id: "2",
    name: "Birthday",
    slug: "birthday",
    imageAlt: "Birthday flowers",
    imageUrl: pexelsPhoto("19301032", 400),
  },
  {
    id: "3",
    name: "Anniversary",
    slug: "anniversary",
    imageAlt: "Anniversary flowers",
    imageUrl: pexelsPhoto("35568784", 400),
  },
  {
    id: "4",
    name: "Plants",
    slug: "plants",
    imageAlt: "Indoor plants",
    imageUrl: pexelsPhoto("9507280", 400),
  },
  {
    id: "5",
    name: "Cakes",
    slug: "cakes",
    imageAlt: "Cakes",
    imageUrl: pexelsPhoto("27848148", 400),
  },
  {
    id: "6",
    name: "Sympathy",
    slug: "sympathy",
    imageAlt: "Sympathy flowers",
    imageUrl: pexelsPhoto("7317682", 400),
  },
];

export async function getFeaturedCategories(): Promise<Category[]> {
  // TODO(prisma-milestone): return prisma.category.findMany({ where: { featured: true } });
  return FEATURED_CATEGORIES;
}
