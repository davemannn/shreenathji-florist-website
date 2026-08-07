export interface Product {
  id: string;
  slug: string;
  title: string;
  /** INR, whole rupees — the default variant's price. */
  price: number;
  compareAtPrice?: number;
  /** The default variant — what "Add to Cart" from a card (not the PDP) adds. */
  defaultVariantId: string;
  defaultVariantLabel: string;
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

// ---------------------------------------------------------------------------
// Admin panel — catalog management (Phase 3). Deliberately separate shapes
// from the storefront types above: admin needs every raw editable field
// (per-variant stock, isActive, etc.), not the "default variant" projection
// the storefront card/PDP types are built around.
// ---------------------------------------------------------------------------

export type ProductBadgeValue = "SALE" | "NEW" | "BESTSELLER";

export interface AdminProductVariantInput {
  label: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isDefault: boolean;
}

export interface AdminProductImageInput {
  url: string;
  alt: string;
  cloudinaryId?: string;
}

export interface AdminProductListItem {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  badge?: ProductBadgeValue;
  imageUrl?: string;
  minPrice: number;
  totalStock: number;
  categoryNames: string[];
}

export interface AdminProductDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge?: ProductBadgeValue;
  isActive: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  categoryIds: string[];
  variants: AdminProductVariantInput[];
  images: AdminProductImageInput[];
}
