"use client";

import { Play } from "lucide-react";
import { ReorderDialog } from "@/components/shared/reorder-dialog";
import { ContentImage } from "@/components/shared/content-image";
import { reorderGalleryItemsAction } from "../actions";
import type { AdminGalleryItem } from "../types";

export function ReorderGalleryItemsDialog({ items }: { items: AdminGalleryItem[] }) {
  return (
    <ReorderDialog
      items={items}
      getId={(item) => item.id}
      renderRow={(item) => (
        <div className="flex items-center gap-2">
          <div className="relative size-8 shrink-0">
            <ContentImage
              src={item.thumbnailUrl ?? item.url}
              alt=""
              className="size-8 rounded-sm"
              sizes="32px"
            />
            {item.type === "VIDEO" ? (
              <Play
                className="absolute inset-0 m-auto size-3 text-white drop-shadow"
                aria-hidden="true"
              />
            ) : null}
          </div>
          <span className="truncate">{item.caption || "Untitled"}</span>
        </div>
      )}
      onSave={reorderGalleryItemsAction}
      title="Reorder gallery"
      description="Drag rows into place, or use the arrows. This is the order photos and videos appear in on the gallery page."
    />
  );
}
