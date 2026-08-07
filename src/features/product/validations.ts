import { z } from "zod";

const variantSchema = z.object({
  label: z.string().min(1, "Enter a label"),
  price: z.coerce.number().int().min(1, "Enter a price"),
  compareAtPrice: z.coerce.number().int().min(1).optional(),
  stock: z.coerce.number().int().min(0),
  isDefault: z.boolean(),
});

const imageSchema = z.object({
  url: z.string().min(1, "Upload an image"),
  alt: z.string().min(1, "Enter alt text"),
  cloudinaryId: z.string().optional(),
});

export const productFormSchema = z
  .object({
    slug: z
      .string()
      .min(2, "Enter a slug")
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
    title: z.string().min(2, "Enter a title"),
    description: z.string().min(10, "Enter a description"),
    badge: z.enum(["SALE", "NEW", "BESTSELLER"]).optional(),
    isActive: z.boolean(),
    isBestSeller: z.boolean(),
    isFeatured: z.boolean(),
    categoryIds: z.array(z.string()).min(1, "Choose at least one category"),
    variants: z.array(variantSchema).min(1, "Add at least one variant"),
    images: z.array(imageSchema).min(1, "Add at least one image"),
  })
  .refine((data) => data.variants.filter((v) => v.isDefault).length === 1, {
    message: "Exactly one variant must be marked as default",
    path: ["variants"],
  });

/** Post-validation shape (price/stock coerced to number) — what actions.ts receives. */
export type ProductFormValues = z.output<typeof productFormSchema>;
/** Pre-validation shape (price/stock still whatever the number input gives react-hook-form)
 *  — what useForm<> itself must be typed with when a schema uses z.coerce; see product-form.tsx. */
export type ProductFormInput = z.input<typeof productFormSchema>;
