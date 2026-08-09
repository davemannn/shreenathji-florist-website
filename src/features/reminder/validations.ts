import { z } from "zod";

export const createReminderSchema = z.object({
  occasion: z.enum(["BIRTHDAY", "ANNIVERSARY", "OTHER"]),
  recipientName: z.string().min(2, "Enter a name").max(80),
  month: z.coerce.number().int().min(1).max(12),
  day: z.coerce.number().int().min(1).max(31),
  note: z.string().max(200).optional(),
});

export type CreateReminderValues = z.output<typeof createReminderSchema>;
export type CreateReminderInput = z.input<typeof createReminderSchema>;
