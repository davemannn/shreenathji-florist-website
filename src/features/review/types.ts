// ---------------------------------------------------------------------------
// Admin panel — review moderation (Phase 3). These are real per-product
// Review rows customers submitted via the storefront (see actions.ts's
// submitReviewAction) or seeded via prisma/seed.ts.
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
