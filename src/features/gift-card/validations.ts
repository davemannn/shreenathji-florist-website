import { z } from "zod";
import { indianPhoneSchema } from "@/lib/validations/common";

export const GIFT_CARD_DENOMINATIONS = [500, 1000, 2000, 5000] as const;
export const MIN_GIFT_CARD_AMOUNT = 100;
export const MAX_GIFT_CARD_AMOUNT = 25000;

export const giftCardSchema = z
  .object({
    amount: z
      .number()
      .int()
      .min(MIN_GIFT_CARD_AMOUNT, `Minimum amount is ₹${MIN_GIFT_CARD_AMOUNT}`)
      .max(MAX_GIFT_CARD_AMOUNT, `Maximum amount is ₹${MAX_GIFT_CARD_AMOUNT}`),
    recipientType: z.enum(["SELF", "OTHER"]),
    recipientName: z.string().optional(),
    recipientEmail: z.email("Enter a valid email").optional().or(z.literal("")),
    recipientPhone: z.union([indianPhoneSchema, z.literal("")]).optional(),
    message: z.string().max(300, "Keep it under 300 characters").optional(),
    deliveryDate: z.string().min(1, "Choose a delivery date"),
  })
  .refine((data) => data.recipientType === "SELF" || !!data.recipientName?.trim(), {
    message: "Enter the recipient's name",
    path: ["recipientName"],
  })
  .refine((data) => data.recipientType === "SELF" || !!data.recipientEmail?.trim(), {
    message: "Enter the recipient's email",
    path: ["recipientEmail"],
  });

export type GiftCardValues = z.infer<typeof giftCardSchema>;
