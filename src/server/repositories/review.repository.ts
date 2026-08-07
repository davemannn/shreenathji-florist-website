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
