"use client";

import { useState } from "react";
import { ContentImage } from "@/components/shared/content-image";
import { cn } from "@/lib/utils";
import type { ProductImageItem } from "../types";

export function ProductGallery({ images, title }: { images: ProductImageItem[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? { url: undefined, alt: title };

  return (
    <div className="flex flex-col gap-3">
      <ContentImage
        src={active.url}
        alt={active.alt}
        className="aspect-square rounded-xs"
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority
      />
      {images.length > 1 ? (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-xs border-2",
                index === activeIndex ? "border-brand" : "border-transparent",
              )}
            >
              <ContentImage src={image.url} alt={image.alt} className="size-full" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
