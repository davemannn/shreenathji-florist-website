import {
  listActiveGalleryItems,
  listGalleryItemsAdmin as listGalleryItemsAdminRepo,
} from "@/server/repositories/gallery-item.repository";
import type { AdminGalleryItem, GalleryDisplayItem, GalleryItemType } from "./types";

export async function getGalleryDisplayItems(): Promise<GalleryDisplayItem[]> {
  const items = await listActiveGalleryItems();
  return items.map((item) => ({
    id: item.id,
    type: item.type as GalleryItemType,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl ?? undefined,
    caption: item.caption ?? undefined,
  }));
}

export async function listGalleryItemsAdmin(): Promise<AdminGalleryItem[]> {
  const items = await listGalleryItemsAdminRepo();
  return items.map((item) => ({
    id: item.id,
    type: item.type as GalleryItemType,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl ?? undefined,
    caption: item.caption ?? undefined,
    cloudinaryId: item.cloudinaryId,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
  }));
}
