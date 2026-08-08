import { z } from "zod";

export const addCustomerTagSchema = z.object({
  label: z.string().min(2, "Enter a tag").max(40, "Keep it short"),
});

export type AddCustomerTagValues = z.infer<typeof addCustomerTagSchema>;
