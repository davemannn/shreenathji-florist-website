"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";

interface CloudinaryUploaderProps {
  /** Cloudinary folder this upload lands in — "products", "categories", "blog". */
  folder: string;
  value?: string;
  onChange: (url: string, publicId: string) => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * Signed uploads (via /api/admin/cloudinary-signature), not an unsigned
 * preset — this is an authenticated admin-only surface, so the server can
 * scope folder/size restrictions per upload. Browser uploads go straight to
 * Cloudinary, never through our Node process.
 */
export function CloudinaryUploader({
  folder,
  value,
  onChange,
  onRemove,
  className,
}: CloudinaryUploaderProps) {
  return (
    <CldUploadWidget
      signatureEndpoint="/api/admin/cloudinary-signature"
      options={{
        folder: `shreenathji/${folder}`,
        sources: ["local"],
        multiple: false,
        maxFiles: 1,
      }}
      onSuccess={(result) => {
        if (typeof result.info === "string" || !result.info) return;
        onChange(result.info.secure_url, result.info.public_id);
      }}
    >
      {({ open }) => (
        <div className={className}>
          {value ? (
            <div className="group relative size-24 overflow-hidden rounded-md border">
              <Image src={value} alt="" fill className="object-cover" sizes="96px" />
              {onRemove ? (
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label="Remove image"
                  className="bg-background/90 absolute top-1 right-1 flex size-5 items-center justify-center rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => open()}>
              <ImagePlus className="size-4" aria-hidden="true" />
              Upload Image
            </Button>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
}
