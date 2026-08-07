import { z } from "zod";

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .min(3, "Enter a code")
      .regex(/^[a-zA-Z0-9]+$/, "Letters and numbers only")
      .transform((v) => v.toUpperCase()),
    description: z.string().optional(),
    discountType: z.enum(["PERCENT", "FLAT"]),
    discountValue: z.coerce.number().int().min(1, "Enter a value"),
    minOrderValue: z.coerce.number().int().min(0).optional(),
    maxDiscount: z.coerce.number().int().min(1).optional(),
    expiresAt: z.string().optional(),
    isActive: z.boolean(),
    usageLimit: z.coerce.number().int().min(1).optional(),
  })
  .refine((data) => data.discountType !== "PERCENT" || data.discountValue <= 100, {
    message: "A percentage discount can't exceed 100",
    path: ["discountValue"],
  });

export type CouponFormValues = z.output<typeof couponFormSchema>;
export type CouponFormInput = z.input<typeof couponFormSchema>;
