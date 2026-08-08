import { z } from "zod";

export const createGalleryItemSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().min(1, "Upload a file"),
  cloudinaryId: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  caption: z.string().optional(),
});

export type CreateGalleryItemValues = z.infer<typeof createGalleryItemSchema>;
