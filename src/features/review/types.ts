export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  rating: number;
}

export interface GoogleReview {
  id: string;
  quote: string;
  authorName: string;
  rating: number;
}

export interface GoogleReviewAggregate {
  rating: number;
  count: number;
}

// ---------------------------------------------------------------------------
// Admin panel — review moderation (Phase 3). Distinct from Testimonial/
// GoogleReview above (homepage placeholder content) — these are real
// per-product Review rows customers submitted, seeded via prisma/seed.ts.
// ---------------------------------------------------------------------------

export interface AdminReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  productId: string;
  productTitle: string;
  productSlug: string;
}
