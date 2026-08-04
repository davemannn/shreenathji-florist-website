import { z } from "zod";

/** Cross-cutting Zod schemas shared by multiple features (not entity-specific). */

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const indianPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const indianPinCodeSchema = z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code");
