import { z } from "zod";

export const blogPostFormSchema = z.object({
  slug: z
    .string()
    .min(2, "Enter a slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  title: z.string().min(2, "Enter a title"),
  excerpt: z.string().min(10, "Enter an excerpt"),
  content: z.string().min(20, "Enter the post content"),
  coverImageUrl: z.string().optional(),
  coverImageAlt: z.string().optional(),
  coverImageCloudinaryId: z.string().optional(),
  authorName: z.string().min(2, "Enter an author name"),
  readTimeMinutes: z.coerce.number().int().min(1, "Enter a read time"),
  isPublished: z.boolean(),
});

export type BlogPostFormValues = z.output<typeof blogPostFormSchema>;
export type BlogPostFormInput = z.input<typeof blogPostFormSchema>;
