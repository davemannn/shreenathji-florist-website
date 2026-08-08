"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createGalleryItemAction } from "../actions";

/**
 * Multi-file, image+video — distinct from the single-image
 * CloudinaryUploader used everywhere else in the admin panel (products,
 * categories, banners), since the gallery needs to accept several files
 * in one go and needs Cloudinary's `resource_type: "auto"` to accept video.
 * Each successful upload creates its own GalleryItem row as soon as it
 * finishes, rather than batching client-side.
 */
export function GalleryUploader() {
  const router = useRouter();
  const [uploading, setUploading] = useState(0);

  return (
    <CldUploadWidget
      signatureEndpoint="/api/admin/cloudinary-signature"
      options={{
        folder: "shrinathji/gallery",
        sources: ["local"],
        multiple: true,
        maxFiles: 20,
        resourceType: "auto",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif", "mp4", "mov", "webm"],
        maxFileSize: 50_000_000, // 50MB — generous enough for a short phone-shot video clip
      }}
      onQueuesStart={() => setUploading((n) => n + 1)}
      onSuccess={(result) => {
        if (typeof result.info === "string" || !result.info) return;
        const info = result.info;
        const isVideo = info.resource_type === "video";

        void createGalleryItemAction({
          type: isVideo ? "VIDEO" : "IMAGE",
          url: info.secure_url,
          cloudinaryId: info.public_id,
          // The widget's own response already includes an auto-generated
          // poster-frame URL for any uploaded video.
          thumbnailUrl: isVideo ? info.thumbnail_url : undefined,
        })
          .then(() => {
            router.refresh();
          })
          .catch(() => {
            toast.error("One of the uploads didn't save — try that file again.");
          });
      }}
      onQueuesEnd={() => {
        setUploading((n) => Math.max(0, n - 1));
        toast.success("Upload complete.");
      }}
    >
      {({ open }) => (
        <Button type="button" variant="brand" onClick={() => open()} disabled={uploading > 0}>
          <UploadCloud className="size-4" aria-hidden="true" />
          {uploading > 0 ? "Uploading…" : "Add Photos or Videos"}
        </Button>
      )}
    </CldUploadWidget>
  );
}
