import { prisma } from "@/server/db/prisma";

/**
 * Admin moderation only — the storefront's own review display (PDP) reads
 * reviews as part of product.repository.ts's findProductBySlug include,
 * already scoped to isApproved=true. This file is for seeing/moderating
 * every review across every product, not a single product's approved list.
 */

export interface ListReviewsAdminParams {
  status?: "approved" | "pending";
  page?: number;
  pageSize?: number;
}

export async function listReviewsAdmin(params: ListReviewsAdminParams = {}) {
  const { status, page = 1, pageSize = 20 } = params;

  const where = status ? { isApproved: status === "approved" } : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { product: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total, page, pageSize };
}

export async function setReviewApproved(id: string, isApproved: boolean) {
  return prisma.review.update({ where: { id }, data: { isApproved } });
}

export async function deleteReview(id: string) {
  return prisma.review.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Storefront — customer review submission.
// ---------------------------------------------------------------------------

export interface CreateReviewInput {
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
}

/**
 * Always creates with isApproved: false regardless of the schema's own
 * default — every real customer submission enters the /admin/reviews
 * moderation queue first (see features/review/actions.ts's
 * submitReviewAction). The unique (productId, userId) index means a
 * second submission from the same user for the same product throws
 * instead of silently duplicating — caught and surfaced as a friendly
 * error by the caller.
 */
export async function createReview(input: CreateReviewInput) {
  return prisma.review.create({ data: { ...input, isApproved: false } });
}

/** Powers "you've already reviewed this" / prefills the form if they have. */
export async function findUserReviewForProduct(productId: string, userId: string) {
  return prisma.review.findUnique({ where: { productId_userId: { productId, userId } } });
}

/**
 * "Verified Purchase" badge — true if this user has ever had this product
 * on a DELIVERED order. A trust signal, not a hard gate: shown when true,
 * but its absence never blocks submitting a review.
 */
export async function hasUserPurchasedProduct(productId: string, userId: string): Promise<boolean> {
  const count = await prisma.orderItem.count({
    where: { productId, order: { userId, status: "DELIVERED" } },
  });
  return count > 0;
}
