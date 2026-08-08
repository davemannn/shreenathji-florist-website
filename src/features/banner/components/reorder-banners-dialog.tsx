"use client";

import { ReorderDialog } from "@/components/shared/reorder-dialog";
import { ContentImage } from "@/components/shared/content-image";
import { reorderBannersAction } from "../actions";
import type { AdminBanner } from "../types";

export function ReorderBannersDialog({ banners }: { banners: AdminBanner[] }) {
  return (
    <ReorderDialog
      items={banners}
      getId={(banner) => banner.id}
      renderRow={(banner) => (
        <div className="flex items-center gap-2">
          <ContentImage
            src={banner.imageUrl}
            alt=""
            className="size-8 shrink-0 rounded-sm"
            sizes="32px"
          />
          <span className="truncate">{banner.headline.split("\n")[0]}</span>
        </div>
      )}
      onSave={reorderBannersAction}
      title="Reorder banners"
      description="Drag rows into place, or use the arrows. This is the order they appear in within this placement."
    />
  );
}
