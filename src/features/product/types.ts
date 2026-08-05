export interface Product {
  id: string;
  slug: string;
  title: string;
  /** INR, whole rupees — the default variant's price. */
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: "sale" | "new" | "bestseller";
  imageAlt: string;
  imageUrl?: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isDefault: boolean;
}

export interface ProductReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductImageItem {
  url: string;
  alt: string;
}

export interface ProductDetail extends Product {
  description: string;
  images: ProductImageItem[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  categorySlugs: string[];
}
