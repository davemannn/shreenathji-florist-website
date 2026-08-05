import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ContentImage } from "@/components/shared/content-image";
import { StarRating } from "@/components/shared/star-rating";
import { formatINR } from "@/lib/format";
import { WishlistToggleButton } from "./wishlist-toggle-button";
import { QuickViewTrigger } from "./quick-view-trigger";
import { AddToCartButton } from "./add-to-cart-button";
import type { Product } from "../types";

const BADGE_LABEL: Record<NonNullable<Product["badge"]>, string> = {
  sale: "Sale",
  new: "New",
  bestseller: "Bestseller",
};

/**
 * Stays a Server Component — only the wishlist toggle, quick-view trigger,
 * and add-to-cart button are Client leaves (they touch zustand state or open
 * a dialog). The hover image-swap the reference theme uses is skipped for
 * now since there's only ever one placeholder image per product.
 */
export function ProductCard({ product }: { product: Product }) {
  const productHref = `/shop/product/${product.slug}`;

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative">
        <Link href={productHref} className="block">
          <ContentImage
            src={product.imageUrl}
            alt={product.imageAlt}
            className="aspect-4/5 rounded-md"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        </Link>
        {product.badge ? (
          <Badge className="bg-brand text-brand-foreground absolute top-3 left-3 border-transparent">
            {BADGE_LABEL[product.badge]}
          </Badge>
        ) : null}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <WishlistToggleButton productId={product.id} productTitle={product.title} />
          <QuickViewTrigger product={product} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <Link href={productHref} className="text-sm font-medium hover:underline">
          {product.title}
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatINR(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-muted-foreground text-sm line-through">
              {formatINR(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
      </div>

      <AddToCartButton
        item={{
          productId: product.id,
          productSlug: product.slug,
          variantId: product.defaultVariantId,
          productTitle: product.title,
          variantLabel: product.defaultVariantLabel,
          imageUrl: product.imageUrl,
          price: product.price,
        }}
      />
    </div>
  );
}
