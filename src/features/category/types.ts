export interface Category {
  id: string;
  name: string;
  slug: string;
  imageAlt: string;
  imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Admin panel — catalog management (Phase 3).
// ---------------------------------------------------------------------------

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageCloudinaryId?: string;
  isOccasion: boolean;
  isRecipient: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  sortOrder: number;
  productCount: number;
  /** GST% for products in this category — see lib/tax.ts's resolveProductTax. Only meaningful on Shop categories (isOccasion: false). */
  gstRate?: number;
  hsnCode?: string;
}
