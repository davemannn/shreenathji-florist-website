"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Eye, EyeOff, Trash2, Pencil, Check, X } from "lucide-react";
import { ContentImage } from "@/components/shared/content-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteGalleryItemAction,
  setGalleryItemActiveAction,
  updateGalleryItemCaptionAction,
} from "../actions";
import type { AdminGalleryItem } from "../types";

function GalleryAdminCard({ item }: { item: AdminGalleryItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(item.caption ?? "");

  function handleToggleActive() {
    startTransition(async () => {
      try {
        await setGalleryItemActiveAction(item.id, !item.isActive);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this item.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Remove this from the gallery? This can't be undone.")) return;
    startTransition(async () => {
      try {
        await deleteGalleryItemAction(item.id);
        toast.success("Removed.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't remove this item.");
      }
    });
  }

  function handleSaveCaption() {
    startTransition(async () => {
      try {
        await updateGalleryItemCaptionAction(item.id, caption);
        setEditing(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't save the caption.");
      }
    });
  }

  return (
    <div
      className={`border-border group relative overflow-hidden rounded-md border ${!item.isActive ? "opacity-50" : ""}`}
    >
      <div className="bg-muted relative aspect-square">
        <ContentImage
          src={item.thumbnailUrl ?? item.url}
          alt={item.caption ?? ""}
          className="aspect-square"
          sizes="(min-width: 1024px) 20vw, 33vw"
        />
        {item.type === "VIDEO" ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Play className="size-8 text-white drop-shadow" aria-hidden="true" />
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="bg-background/90 hover:bg-background"
            disabled={isPending}
            onClick={handleToggleActive}
            aria-label={item.isActive ? "Hide from gallery" : "Show on gallery"}
          >
            {item.isActive ? (
              <Eye className="size-3.5" aria-hidden="true" />
            ) : (
              <EyeOff className="size-3.5" aria-hidden="true" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="bg-background/90 hover:bg-background"
            disabled={isPending}
            onClick={() => setEditing(true)}
            aria-label="Edit caption"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="bg-background/90 hover:bg-background"
            disabled={isPending}
            onClick={handleDelete}
            aria-label="Delete"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
      {editing ? (
        <div className="flex items-center gap-1 p-1.5">
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="h-7 text-xs"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={isPending}
            onClick={handleSaveCaption}
            aria-label="Save caption"
          >
            <Check className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setCaption(item.caption ?? "");
              setEditing(false);
            }}
            aria-label="Cancel"
          >
            <X className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      ) : item.caption ? (
        <p className="text-muted-foreground truncate p-1.5 text-xs">{item.caption}</p>
      ) : null}
    </div>
  );
}

export function GalleryAdminGrid({ items }: { items: AdminGalleryItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        No photos or videos yet — add some above.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <GalleryAdminCard key={item.id} item={item} />
      ))}
    </div>
  );
}
