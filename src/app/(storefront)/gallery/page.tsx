import type { Metadata } from "next";
import { InstagramGrid } from "@/features/gallery/components/instagram-grid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look at recent bouquets, cakes and decor setups from Shreenathji Florist.",
};

export default function GalleryPage() {
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
      <InstagramGrid />
    </div>
  );
}
