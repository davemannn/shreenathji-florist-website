import { z } from "zod";

export const bannerFormSchema = z
  .object({
    type: z.enum(["HERO", "PROMO", "OCCASION"]),
    eyebrow: z.string().optional(),
    headline: z.string().min(2, "Enter a headline"),
    subtitle: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
    imageUrl: z.string().optional(),
    imageAlt: z.string().optional(),
    imageCloudinaryId: z.string().optional(),
    isActive: z.boolean(),
    // Date-only (matches the coupon form's expiresAt pattern) — a banner's
    // schedule is day-granular, not to-the-minute.
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
  })
  .refine((data) => !data.startsAt || !data.endsAt || data.startsAt <= data.endsAt, {
    message: "End date can't be before the start date",
    path: ["endsAt"],
  });

export type BannerFormValues = z.output<typeof bannerFormSchema>;
export type BannerFormInput = z.input<typeof bannerFormSchema>;
