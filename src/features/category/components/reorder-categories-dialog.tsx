"use client";

import { ReorderDialog } from "@/components/shared/reorder-dialog";
import { ContentImage } from "@/components/shared/content-image";
import { reorderCategoriesAction } from "../actions";

interface ReorderRow {
  id: string;
  name: string;
  imageUrl?: string;
}

export function ReorderCategoriesDialog({ categories }: { categories: ReorderRow[] }) {
  return (
    <ReorderDialog
      items={categories}
      getId={(category) => category.id}
      renderRow={(category) => (
        <div className="flex items-center gap-2">
          <ContentImage
            src={category.imageUrl}
            alt=""
            className="size-8 shrink-0 rounded-sm"
            sizes="32px"
          />
          <span className="truncate">{category.name}</span>
        </div>
      )}
      onSave={reorderCategoriesAction}
      title="Reorder categories"
      description="Drag rows into place, or use the arrows. This is the order categories appear in on the storefront."
    />
  );
}
