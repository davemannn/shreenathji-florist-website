import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.email("Enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(10, "Tell us a little more (at least 10 characters)"),
});

export type ContactMessageValues = z.infer<typeof contactMessageSchema>;
