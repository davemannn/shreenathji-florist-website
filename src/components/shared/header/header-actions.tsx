"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartItemCount } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useSession } from "@/lib/auth-client";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="bg-brand text-brand-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
      {count}
    </span>
  );
}

/**
 * Search/account/wishlist/cart icon cluster. Cart is a real persisted
 * zustand store (see src/stores/cart-store.ts); wishlist is in-memory only
 * for now (no persistence — resets on refresh, no SSR-hydration concern).
 * Search has no backend yet; it links to a future /search route rather than
 * pretending to work.
 */
export function HeaderActions() {
  const cartCount = useCartItemCount();
  const wishlistCount = useWishlistStore((state) => state.productIds.size);
  const { data: session } = useSession();
  const accountHref = session ? "/account" : "/sign-in";

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
        aria-label={session ? `Account, signed in as ${session.user.name}` : "Sign in"}
        nativeButton={false}
        render={<Link href={accountHref} />}
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
