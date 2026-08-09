import { z } from "zod";

/** Standard 15-character GSTIN format: 2-digit state code + 10-char PAN + entity/checksum chars. */
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const storeSettingsFormSchema = z
  .object({
    baseDeliveryCharge: z.coerce.number().int().min(0),
    freeDeliveryThreshold: z.coerce.number().int().min(0),
    midnightCutoffHour: z.coerce.number().int().min(0).max(23),
    storeLatitude: z.coerce.number().min(-90).max(90).optional(),
    storeLongitude: z.coerce.number().min(-180).max(180).optional(),
    deliveryRadiusKm: z.coerce.number().int().min(1).max(200),
    gstin: z
      .string()
      .toUpperCase()
      .regex(GSTIN_REGEX, "Enter a valid 15-character GSTIN, e.g. 24AAAAA0000A1Z5")
      .optional()
      .or(z.literal("")),
    legalBusinessName: z.string().optional(),
    registeredAddressLine: z.string().optional(),
    registeredCity: z.string().optional(),
    registeredState: z.string().min(2, "Enter the registered state"),
    registeredPincode: z.string().optional(),
    defaultGstRate: z.coerce.number().int().min(0).max(28),
    invoicePrefix: z
      .string()
      .min(1, "Enter a prefix")
      .max(10, "Keep it short")
      .regex(/^[A-Za-z0-9]+$/, "Letters and numbers only"),
    codEnabled: z.boolean(),
    razorpayEnabled: z.boolean(),
  })
  .refine((data) => data.codEnabled || data.razorpayEnabled, {
    message: "At least one payment method must stay enabled",
    path: ["codEnabled"],
  });

export type StoreSettingsFormValues = z.output<typeof storeSettingsFormSchema>;
export type StoreSettingsFormInput = z.input<typeof storeSettingsFormSchema>;
