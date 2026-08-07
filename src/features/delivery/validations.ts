import { z } from "zod";

export const deliverySlotFormSchema = z.object({
  label: z.string().min(2, "Enter a label"),
  type: z.enum(["NORMAL", "FIXED", "MIDNIGHT"]),
  extraCharge: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export type DeliverySlotFormValues = z.output<typeof deliverySlotFormSchema>;
export type DeliverySlotFormInput = z.input<typeof deliverySlotFormSchema>;
