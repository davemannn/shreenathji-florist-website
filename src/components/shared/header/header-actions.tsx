"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="bg-brand text-brand-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
      {count}
    </span>
  );
}

/**
 * Search/account/wishlist/cart icon cluster. Cart and wishlist counts are
 * zustand-backed (always 0 today — see src/stores/) rather than hidden, so
 * the badge UI is already correct once those features have real state.
 * Search has no backend yet; it links to a future /search route rather than
 * pretending to work.
 */
export function HeaderActions() {
  const cartCount = useCartStore((state) => state.itemCount);
  const wishlistCount = useWishlistStore((state) => state.productIds.size);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        nativeButton={false}
        render={<Link href="/search" />}
      >
        <Search aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Account"
        nativeButton={false}
        render={<Link href="/account" />}
      >
        <User aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Wishlist, ${wishlistCount} items`}
        className="relative"
        nativeButton={false}
        render={<Link href="/wishlist" />}
      >
        <Heart aria-hidden="true" />
        <CountBadge count={wishlistCount} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Cart, ${cartCount} items`}
        className="relative"
        nativeButton={false}
        render={<Link href="/cart" />}
      >
        <ShoppingBag aria-hidden="true" />
        <CountBadge count={cartCount} />
      </Button>
    </div>
  );
}
