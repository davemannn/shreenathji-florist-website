import { z } from "zod";

export const testimonialFormSchema = z.object({
  authorName: z.string().min(2, "Enter the author's name").max(80),
  quote: z.string().min(10, "Enter at least a short quote").max(500),
  rating: z.coerce.number().int().min(1).max(5),
  photoUrl: z.string().optional(),
  isActive: z.boolean(),
});

export type TestimonialFormValues = z.output<typeof testimonialFormSchema>;
export type TestimonialFormInput = z.input<typeof testimonialFormSchema>;
