import { z } from "zod";

export const submitReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5),
  comment: z.string().min(10, "Write at least a short review").max(1000),
});

export type SubmitReviewValues = z.output<typeof submitReviewSchema>;
export type SubmitReviewInput = z.input<typeof submitReviewSchema>;
