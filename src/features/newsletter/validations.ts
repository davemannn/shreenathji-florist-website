import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export type NewsletterSubscribeValues = z.infer<typeof newsletterSubscribeSchema>;
