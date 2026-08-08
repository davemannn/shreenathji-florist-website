import { z } from "zod";

export const holidayFormSchema = z.object({
  date: z.string().min(1, "Choose a date"),
  label: z.string().min(2, "Enter a label"),
  blocksAllDelivery: z.boolean(),
});

export type HolidayFormValues = z.infer<typeof holidayFormSchema>;
