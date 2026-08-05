export interface Product {
  id: string;
  slug: string;
  title: string;
  /** INR, whole rupees. */
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: "sale" | "new" | "bestseller";
  imageAlt: string;
  imageUrl?: string;
}
