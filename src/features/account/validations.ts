import { z } from "zod";
import { indianPhoneSchema, indianPinCodeSchema } from "@/lib/validations/common";

export const addressSchema = z.object({
  label: z.string().max(30, "Keep it short").optional(),
  recipientName: z.string().min(2, "Enter the recipient's name"),
  recipientPhone: indianPhoneSchema,
  line1: z.string().min(3, "Enter the address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a city"),
  state: z.string().min(2, "Enter a state"),
  pincode: indianPinCodeSchema,
  // Set via the Places autocomplete (see place-autocomplete-input.tsx),
  // never a user-typed field — plain z.number(), not .coerce.
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type AddressValues = z.infer<typeof addressSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, "Enter your name"),
});

export type ProfileValues = z.infer<typeof profileSchema>;
