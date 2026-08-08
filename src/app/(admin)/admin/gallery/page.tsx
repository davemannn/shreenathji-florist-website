import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listGalleryItemsAdmin } from "@/features/gallery/queries";
import { GalleryUploader } from "@/features/gallery/components/gallery-uploader";
import { GalleryAdminGrid } from "@/features/gallery/components/gallery-admin-grid";
import { ReorderGalleryItemsDialog } from "@/features/gallery/components/reorder-gallery-items-dialog";

export const metadata: Metadata = {
  title: "Gallery",
};

export default async function AdminGalleryPage() {
  await requireAdminSession("gallery:manage");

  const items = await listGalleryItemsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gallery</h1>
          <p className="text-muted-foreground text-sm">
            {items.length} item{items.length === 1 ? "" : "s"} — shown on the storefront{" "}
            <code>/gallery</code> page. Hidden items stay here but drop off the live page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReorderGalleryItemsDialog items={items} />
          <GalleryUploader />
        </div>
      </div>

      <GalleryAdminGrid items={items} />
    </div>
  );
}
