"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentImage } from "@/components/shared/content-image";
import type { GalleryDisplayItem } from "../types";

/**
 * Bento-style grid (fixed square cells, occasional 2x2 "featured" tiles for
 * visual rhythm) rather than true masonry — ContentImage is fill-only, so a
 * height-varying masonry layout would need each upload's real width/height
 * stored just to size tiles correctly. This gets the same "modern,
 * artistic, not a plain uniform grid" feel without that extra schema.
 */
export function GalleryMasonry({ items }: { items: GalleryDisplayItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length],
  );
  const showNext = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [activeIndex, close, showPrev, showNext]);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        Our gallery is being freshened up — check back soon.
      </p>
    );
  }

  const active = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[180px] sm:grid-cols-4 lg:auto-rows-[200px] lg:grid-cols-6">
        {items.map((item, index) => {
          // Every 7th tile (0-indexed: 3, 10, 17…) spans 2x2 for a featured
          // look — a fixed, deterministic rhythm rather than random, so the
          // layout doesn't reshuffle oddly as items are added/removed.
          const isFeatured = index % 7 === 3;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "group relative block overflow-hidden rounded-md",
                isFeatured && "col-span-2 row-span-2",
              )}
            >
              <ContentImage
                src={item.thumbnailUrl ?? item.url}
                alt={item.caption ?? ""}
                className="h-full transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 1024px) 20vw, 40vw"
              />
              {item.type === "VIDEO" ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
                    <Play className="text-foreground ml-0.5 size-4" aria-hidden="true" />
                  </span>
                </div>
              ) : null}
              {item.caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {item.caption}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={active.caption ?? "Gallery item"}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="size-7" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Previous"
            className="absolute left-2 text-white/70 hover:text-white md:left-6"
          >
            <ChevronLeft className="size-9" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Next"
            className="absolute right-2 text-white/70 hover:text-white md:right-6"
          >
            <ChevronRight className="size-9" aria-hidden="true" />
          </button>

          <div
            className="flex max-h-full max-w-4xl flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {active.type === "VIDEO" ? (
              <video
                src={active.url}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-md"
              />
            ) : (
              // Full-bleed lightbox view — plain img rather than next/image,
              // since this is a one-off viewer (no layout shift to protect
              // against) and the natural size varies per upload.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.url}
                alt={active.caption ?? ""}
                className="max-h-[80vh] max-w-full rounded-md object-contain"
              />
            )}
            {active.caption ? (
              <p className="text-center text-sm text-white/80">{active.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
