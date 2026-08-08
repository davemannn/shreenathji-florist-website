import type { Metadata } from "next";
import { getGalleryDisplayItems } from "@/features/gallery/queries";
import { GalleryMasonry } from "@/features/gallery/components/gallery-masonry";
import { InstagramGrid } from "@/features/gallery/components/instagram-grid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look at recent bouquets, cakes and decor setups from Shrinathji Florist.",
};

// Admin-managed content (features/gallery/actions.ts) — without this, Next
// would prerender the grid once at build time and never reflect edits made
// through /admin/gallery afterwards. Same reasoning as the homepage.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await getGalleryDisplayItems();

  return (
    <div className="flex flex-col">
      <div className="mx-auto max-w-3xl px-4 pt-16 text-center md:px-6 lg:px-8">
        <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">Gallery</p>
        <h1 className="mt-3 text-3xl md:text-5xl">Real Arrangements, Real Moments</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm md:text-base">
          A peek at recent bouquets, cakes, and decor setups we&apos;ve put together for customers
          across Vadodara.
        </p>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <GalleryMasonry items={items} />
      </div>

      <InstagramGrid />
    </div>
  );
}
