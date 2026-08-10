import { z } from "zod";
import { indianPhoneSchema, indianPinCodeSchema } from "@/lib/validations/common";

/**
 * One form, three flattened interval fieldsets (weekly/monthly/annual)
 * rather than a dynamic array — a subscription plan only ever has these
 * three possible cadences, so this stays simpler than generic array-field
 * handling for no real loss of flexibility. Each cadence is independently
 * enable-able; price/discount only matter when its own `*Enabled` is true
 * (enforced in the action, not here, since cross-field conditionals in Zod
 * get unwieldy — see features/subscription/actions.ts).
 */
export const subscriptionPlanFormSchema = z.object({
  name: z.string().min(2, "Enter a name").max(100),
  description: z.string().min(10, "Enter a description").max(1000),
  category: z.enum(["DAILY_POOJA", "WEEKLY_FLOWERS", "RAW_FLOWERS", "CUSTOM"]),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),

  weeklyEnabled: z.boolean(),
  weeklyPrice: z.coerce.number().int().min(0),
  weeklyDiscountPercent: z.coerce.number().int().min(0).max(90),

  monthlyEnabled: z.boolean(),
  monthlyPrice: z.coerce.number().int().min(0),
  monthlyDiscountPercent: z.coerce.number().int().min(0).max(90),

  annualEnabled: z.boolean(),
  annualPrice: z.coerce.number().int().min(0),
  annualDiscountPercent: z.coerce.number().int().min(0).max(90),
});

export type SubscriptionPlanFormValues = z.output<typeof subscriptionPlanFormSchema>;
export type SubscriptionPlanFormInput = z.input<typeof subscriptionPlanFormSchema>;

export const subscribeFormSchema = z.object({
  subscriptionPlanIntervalId: z.string().min(1, "Choose a plan"),
  recipientName: z.string().min(2, "Enter the recipient's name"),
  recipientPhone: indianPhoneSchema,
  line1: z.string().min(3, "Enter the delivery address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a city"),
  state: z.string().min(2, "Enter a state"),
  pincode: indianPinCodeSchema,
});

export type SubscribeFormValues = z.output<typeof subscribeFormSchema>;
export type SubscribeFormInput = z.input<typeof subscribeFormSchema>;

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1),
  cancelAtCycleEnd: z.boolean(),
});
export type CancelSubscriptionValues = z.infer<typeof cancelSubscriptionSchema>;

export const subscriptionIdSchema = z.object({
  subscriptionId: z.string().min(1),
});
export type SubscriptionIdValues = z.infer<typeof subscriptionIdSchema>;
