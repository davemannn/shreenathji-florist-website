"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { deleteReview, setReviewApproved } from "@/server/repositories/review.repository";

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
