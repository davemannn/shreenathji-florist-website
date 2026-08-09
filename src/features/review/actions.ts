"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/config";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  createReview,
  deleteReview,
  findUserReviewForProduct,
  setReviewApproved,
} from "@/server/repositories/review.repository";
import { submitReviewSchema, type SubmitReviewValues } from "./validations";

export async function setReviewApprovedAction(id: string, isApproved: boolean) {
  await requireAdminCapability("reviews:moderate");
  await setReviewApproved(id, isApproved);
  revalidatePath("/admin/reviews");
}

export async function deleteReviewAction(id: string) {
  await requireAdminCapability("reviews:moderate");
  await deleteReview(id);
  revalidatePath("/admin/reviews");
}

/**
 * Customer submission — signed-in only (matches this app's existing
 * "must be signed in" gate for checkout/wishlist/gift cards, no anonymous
 * review path). Always lands in the moderation queue (isApproved: false,
 * enforced in the repository regardless of the schema's own default), not
 * live immediately. `productSlug` is only used to revalidate the right PDP.
 */
export async function submitReviewAction(input: SubmitReviewValues & { productSlug: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to write a review.");
  }

  const { productSlug, ...rest } = input;
  const values = submitReviewSchema.parse(rest);

  const existing = await findUserReviewForProduct(values.productId, session.user.id);
  if (existing) {
    throw new Error("You've already reviewed this product.");
  }

  await createReview({
    productId: values.productId,
    userId: session.user.id,
    authorName: session.user.name,
    rating: values.rating,
    comment: values.comment,
  });

  revalidatePath(`/shop/product/${productSlug}`);
}
