"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWishlistStore, type WishlistItem } from "@/stores/wishlist-store";

interface WishlistToggleButtonProps {
  item: WishlistItem;
}

export function WishlistToggleButton({ item }: WishlistToggleButtonProps) {
  const isWishlisted = useWishlistStore((state) =>
    state.items.some((i) => i.productId === item.productId),
  );
  const toggle = useWishlistStore((state) => state.toggle);

  return (
    <Button
      variant="secondary"
      size="icon-sm"
      className="rounded-full"
      aria-pressed={isWishlisted}
      aria-label={
        isWishlisted ? `Remove ${item.title} from wishlist` : `Add ${item.title} to wishlist`
      }
      onClick={() => toggle(item)}
    >
      <Heart className={cn("size-4", isWishlisted && "fill-brand text-brand")} aria-hidden="true" />
    </Button>
  );
}
