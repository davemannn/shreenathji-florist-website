"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { ContentImage } from "@/components/shared/content-image";
import { StarRating } from "@/components/shared/star-rating";
import { formatINR } from "@/lib/format";
import { useWishlistStore, type WishlistItem } from "@/stores/wishlist-store";
import { AddToCartButton } from "@/features/product/components/add-to-cart-button";

export function WishlistItemCard({ item }: { item: WishlistItem }) {
  const remove = useWishlistStore((state) => state.remove);
  const productHref = `/shop/product/${item.slug}`;

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative">
        <Link href={productHref} className="block">
          <ContentImage
            src={item.imageUrl}
            alt={item.imageAlt}
            className="aspect-4/5 rounded-md"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        </Link>
        <button
          type="button"
          onClick={() => remove(item.productId)}
          aria-label={`Remove ${item.title} from wishlist`}
          className="bg-background/90 hover:bg-background absolute top-3 right-3 flex size-8 items-center justify-center rounded-full shadow-sm"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <StarRating rating={item.rating} reviewCount={item.reviewCount} />
        <Link href={productHref} className="text-sm font-medium hover:underline">
          {item.title}
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatINR(item.price)}</span>
          {item.compareAtPrice ? (
            <span className="text-muted-foreground text-sm line-through">
              {formatINR(item.compareAtPrice)}
            </span>
          ) : null}
        </div>
      </div>

      <AddToCartButton
        item={{
          productId: item.productId,
          productSlug: item.slug,
          variantId: item.defaultVariantId,
          productTitle: item.title,
          variantLabel: item.defaultVariantLabel,
          imageUrl: item.imageUrl,
          price: item.price,
        }}
      />
    </div>
  );
}
