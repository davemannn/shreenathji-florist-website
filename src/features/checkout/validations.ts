import { z } from "zod";
import { indianPhoneSchema, indianPinCodeSchema } from "@/lib/validations/common";

export const checkoutSchema = z.object({
  recipientName: z.string().min(2, "Enter the recipient's name"),
  recipientPhone: indianPhoneSchema,
  line1: z.string().min(3, "Enter the delivery address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a city"),
  state: z.string().min(2, "Enter a state"),
  pincode: indianPinCodeSchema,
  deliveryDate: z.string().min(1, "Choose a delivery date"),
  deliverySlotId: z.string().optional(),
  messageCard: z.string().max(300, "Keep it under 300 characters").optional(),
  giftWrap: z.boolean(),
  paymentMethod: z.enum(["COD", "RAZORPAY"]),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
