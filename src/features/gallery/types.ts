export type GalleryItemType = "IMAGE" | "VIDEO";

export interface GalleryDisplayItem {
  id: string;
  type: GalleryItemType;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
}

export interface AdminGalleryItem extends GalleryDisplayItem {
  cloudinaryId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}
