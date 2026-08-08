import { z } from "zod";

const cartSnapshotItemSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  variantId: z.string().min(1),
  productTitle: z.string().min(1),
  variantLabel: z.string().min(1),
  imageUrl: z.string().optional(),
  price: z.coerce.number().int().min(0),
  quantity: z.coerce.number().int().min(1),
});

export const syncCartSnapshotSchema = z.object({
  items: z.array(cartSnapshotItemSchema),
  subtotal: z.coerce.number().int().min(0),
});

export type SyncCartSnapshotInput = z.infer<typeof syncCartSnapshotSchema>;
