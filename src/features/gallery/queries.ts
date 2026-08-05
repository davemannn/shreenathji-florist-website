import type { GalleryImage } from "./types";

const GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 6 }, (_, index) => ({
  id: String(index + 1),
  imageAlt: `Gallery photo ${index + 1}`,
  href: "https://instagram.com/shreenathjiflorist",
}));

export async function getGalleryImages(): Promise<GalleryImage[]> {
  return GALLERY_IMAGES;
}
