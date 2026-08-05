"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";

interface WishlistToggleButtonProps {
  productId: string;
  productTitle: string;
}

export function WishlistToggleButton({ productId, productTitle }: WishlistToggleButtonProps) {
  const isWishlisted = useWishlistStore((state) => state.productIds.has(productId));
  const toggle = useWishlistStore((state) => state.toggle);

  return (
    <Button
      variant="secondary"
      size="icon-sm"
      className="rounded-full"
      aria-pressed={isWishlisted}
      aria-label={
        isWishlisted ? `Remove ${productTitle} from wishlist` : `Add ${productTitle} to wishlist`
      }
      onClick={() => toggle(productId)}
    >
      <Heart className={cn("size-4", isWishlisted && "fill-brand text-brand")} aria-hidden="true" />
    </Button>
  );
}
