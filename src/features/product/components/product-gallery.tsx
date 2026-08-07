"use client";

import { useState } from "react";
import { ContentImage } from "@/components/shared/content-image";
import { cn } from "@/lib/utils";
import { useVariantSelection } from "./variant-selection-context";
import type { ProductImageItem, ProductVariant } from "../types";

interface ProductGalleryProps {
  images: ProductImageItem[];
  title: string;
  /** When the selected variant has its own photo, it's shown first — see variant-selection-context. */
  variants?: ProductVariant[];
}

export function ProductGallery({ images, title, variants }: ProductGalleryProps) {
  const { variantId } = useVariantSelection();
  const selectedVariant = variants?.find((v) => v.id === variantId);

  const galleryImages = selectedVariant?.imageUrl
    ? [
        { url: selectedVariant.imageUrl, alt: `${title} — ${selectedVariant.label}` },
        ...images.filter((image) => image.url !== selectedVariant.imageUrl),
      ]
    : images;

  const [activeIndex, setActiveIndex] = useState(0);
  // Jump back to the variant's own photo whenever the customer switches
  // variants, instead of leaving whatever thumbnail they'd previously clicked
  // active — adjusted during render (React's documented pattern for
  // resetting state on a prop change), not in an effect, so it doesn't
  // trigger an extra cascading render.
  const [resetForVariantId, setResetForVariantId] = useState(variantId);
  if (variantId !== resetForVariantId) {
    setResetForVariantId(variantId);
    setActiveIndex(0);
  }
  const active = galleryImages[activeIndex] ?? { url: undefined, alt: title };

  return (
    <div className="flex flex-col gap-3">
      <ContentImage
        src={active.url}
        alt={active.alt}
        className="aspect-square rounded-xs"
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority
      />
      {galleryImages.length > 1 ? (
        <div className="flex gap-3">
          {galleryImages.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${galleryImages.length}`}
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
