import { z } from "zod";

export const storeSettingsFormSchema = z.object({
  baseDeliveryCharge: z.coerce.number().int().min(0),
  freeDeliveryThreshold: z.coerce.number().int().min(0),
  midnightCutoffHour: z.coerce.number().int().min(0).max(23),
  expressCharge: z.coerce.number().int().min(0),
  midnightCharge: z.coerce.number().int().min(0),
});

export type StoreSettingsFormValues = z.output<typeof storeSettingsFormSchema>;
export type StoreSettingsFormInput = z.input<typeof storeSettingsFormSchema>;
