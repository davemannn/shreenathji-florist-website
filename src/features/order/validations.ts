import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  toStatus: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
  note: z.string().max(300).optional(),
});
export type UpdateOrderStatusValues = z.infer<typeof updateOrderStatusSchema>;

export const assignDeliveryPersonSchema = z.object({
  orderId: z.string().min(1),
  deliveryPersonId: z.string().nullable(),
});
export type AssignDeliveryPersonValues = z.infer<typeof assignDeliveryPersonSchema>;
