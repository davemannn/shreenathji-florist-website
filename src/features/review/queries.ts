import {
  findUserReviewForProduct,
  hasUserPurchasedProduct,
  listReviewsAdmin as listReviewsAdminRepo,
  type ListReviewsAdminParams,
} from "@/server/repositories/review.repository";
import type { AdminReview } from "./types";

// ---------------------------------------------------------------------------
// Storefront — product detail page review-submission state.
// ---------------------------------------------------------------------------

export interface ReviewEligibility {
  /** True if this signed-in user has already submitted a review for this product — the form shows a "thanks, already reviewed" state instead. */
  hasReviewed: boolean;
  /** True if they have a DELIVERED order containing this product — shown as a "Verified Purchase" badge, not a hard gate. */
  isVerifiedPurchase: boolean;
}

export async function getReviewEligibility(
  productId: string,
  userId: string,
): Promise<ReviewEligibility> {
  const [existing, purchased] = await Promise.all([
    findUserReviewForProduct(productId, userId),
    hasUserPurchasedProduct(productId, userId),
  ]);
  return { hasReviewed: !!existing, isVerifiedPurchase: purchased };
}

// ---------------------------------------------------------------------------
// Admin panel — review moderation (Phase 3).
// ---------------------------------------------------------------------------

export interface AdminReviewListResult {
  reviews: AdminReview[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listReviewsAdmin(
  params: ListReviewsAdminParams = {},
): Promise<AdminReviewListResult> {
  const { reviews, total, page, pageSize } = await listReviewsAdminRepo(params);
  return {
    reviews: reviews.map((review) => ({
      id: review.id,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment,
      isApproved: review.isApproved,
      createdAt: review.createdAt.toISOString(),
      productId: review.productId,
      productTitle: review.product.title,
      productSlug: review.product.slug,
    })),
    total,
    page,
    pageSize,
  };
}
