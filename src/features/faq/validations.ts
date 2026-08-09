import { z } from "zod";

export const faqItemFormSchema = z.object({
  question: z.string().min(5, "Enter the question").max(200),
  answer: z.string().min(5, "Enter the answer").max(1000),
  category: z.string().max(50).optional(),
  isActive: z.boolean(),
});

export type FaqItemFormValues = z.output<typeof faqItemFormSchema>;
export type FaqItemFormInput = z.input<typeof faqItemFormSchema>;
