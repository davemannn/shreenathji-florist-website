import { prisma } from "@/server/db/prisma";

export type GalleryItemType = "IMAGE" | "VIDEO";

/** Active items only, in display order — what the storefront /gallery page actually shows. */
export async function listActiveGalleryItems() {
  return prisma.galleryItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/** Every item regardless of active state — the admin management list. */
export async function listGalleryItemsAdmin() {
  return prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export interface CreateGalleryItemInput {
  type: GalleryItemType;
  url: string;
  cloudinaryId: string;
  thumbnailUrl?: string;
  caption?: string;
}

/** New items land at the end of the display order — reordered visually afterwards, same pattern as categories/banners. */
export async function createGalleryItem(input: CreateGalleryItemInput) {
  const last = await prisma.galleryItem.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.galleryItem.create({
    data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
}

export async function setGalleryItemActive(id: string, isActive: boolean) {
  return prisma.galleryItem.update({ where: { id }, data: { isActive } });
}

export async function updateGalleryItemCaption(id: string, caption: string | null) {
  return prisma.galleryItem.update({ where: { id }, data: { caption } });
}

export async function findGalleryItemById(id: string) {
  return prisma.galleryItem.findUnique({ where: { id } });
}

export async function deleteGalleryItem(id: string) {
  return prisma.galleryItem.delete({ where: { id } });
}

export async function reorderGalleryItems(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.galleryItem.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
}
