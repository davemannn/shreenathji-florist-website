import type { Product } from "./types";

const BEST_SELLERS: Product[] = [
  {
    id: "1",
    slug: "rose-elegance-bouquet",
    title: "Rose Elegance Bouquet",
    price: 899,
    compareAtPrice: 1199,
    rating: 4.6,
    reviewCount: 128,
    badge: "sale",
    imageAlt: "Rose Elegance Bouquet",
  },
  {
    id: "2",
    slug: "sunshine-gerbera-basket",
    title: "Sunshine Gerbera Basket",
    price: 749,
    rating: 4.4,
    reviewCount: 64,
    badge: "bestseller",
    imageAlt: "Sunshine Gerbera Basket",
  },
  {
    id: "3",
    slug: "lily-whisper-vase",
    title: "Lily Whisper Vase",
    price: 1099,
    rating: 4.8,
    reviewCount: 91,
    imageAlt: "Lily Whisper Vase",
  },
  {
    id: "4",
    slug: "chocolate-truffle-cake",
    title: "Chocolate Truffle Cake, 1kg",
    price: 649,
    rating: 4.5,
    reviewCount: 213,
    badge: "bestseller",
    imageAlt: "Chocolate Truffle Cake",
  },
  {
    id: "5",
    slug: "mixed-flower-teddy-combo",
    title: "Mixed Flowers & Teddy Combo",
    price: 999,
    compareAtPrice: 1299,
    rating: 4.3,
    reviewCount: 47,
    badge: "sale",
    imageAlt: "Mixed Flowers & Teddy Combo",
  },
  {
    id: "6",
    slug: "orchid-charm-arrangement",
    title: "Orchid Charm Arrangement",
    price: 1499,
    rating: 4.7,
    reviewCount: 58,
    imageAlt: "Orchid Charm Arrangement",
  },
  {
    id: "7",
    slug: "carnation-cheer-bunch",
    title: "Carnation Cheer Bunch",
    price: 549,
    rating: 4.2,
    reviewCount: 33,
    badge: "new",
    imageAlt: "Carnation Cheer Bunch",
  },
  {
    id: "8",
    slug: "red-velvet-cake-half-kg",
    title: "Red Velvet Cake, 500g",
    price: 549,
    rating: 4.6,
    reviewCount: 87,
    imageAlt: "Red Velvet Cake",
  },
];

export async function getBestSellers(): Promise<Product[]> {
  // TODO(prisma-milestone): return prisma.product.findMany({ where: { isBestSeller: true } });
  return BEST_SELLERS;
}
