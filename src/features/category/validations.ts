import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Enter a name"),
  slug: z
    .string()
    .min(2, "Enter a slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageCloudinaryId: z.string().optional(),
  isOccasion: z.boolean(),
  isFeatured: z.boolean(),
});

export type CategoryFormValues = z.output<typeof categoryFormSchema>;
export type CategoryFormInput = z.input<typeof categoryFormSchema>;
