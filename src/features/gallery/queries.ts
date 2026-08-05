import { pexelsPhoto } from "@/lib/stock-photo";
import type { GalleryImage } from "./types";

const GALLERY_PHOTO_IDS = ["38392600", "20435048", "19363509", "5409707", "4034248", "8865150"];

const GALLERY_IMAGES: GalleryImage[] = GALLERY_PHOTO_IDS.map((photoId, index) => ({
  id: String(index + 1),
  imageAlt: `Gallery photo ${index + 1}`,
  href: "https://instagram.com/shreenathjiflorist",
  imageUrl: pexelsPhoto(photoId, 400),
}));

export async function getGalleryImages(): Promise<GalleryImage[]> {
  return GALLERY_IMAGES;
}
