import { z } from "zod";

/** Standard 15-character GSTIN format: 2-digit state code + 10-char PAN + entity/checksum chars. */
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const storeSettingsFormSchema = z.object({
  baseDeliveryCharge: z.coerce.number().int().min(0),
  freeDeliveryThreshold: z.coerce.number().int().min(0),
  midnightCutoffHour: z.coerce.number().int().min(0).max(23),
  expressCharge: z.coerce.number().int().min(0),
  midnightCharge: z.coerce.number().int().min(0),
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
});

export type StoreSettingsFormValues = z.output<typeof storeSettingsFormSchema>;
export type StoreSettingsFormInput = z.input<typeof storeSettingsFormSchema>;
