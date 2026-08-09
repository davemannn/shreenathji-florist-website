"use client";

import Link from "next/link";
import { Heart, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartItemCount } from "@/stores/cart-store";
import { useWishlistCount } from "@/stores/wishlist-store";
import { useSession } from "@/lib/auth-client";
import { HeaderSearch } from "./header-search";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="bg-brand text-brand-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
      {count}
    </span>
  );
}

/**
 * Search/account/wishlist/cart icon cluster. Cart and wishlist are both
 * real persisted zustand stores (localStorage) — see src/stores/cart-store.ts
 * and src/stores/wishlist-store.ts. Search expands in place (see
 * HeaderSearch) with live debounced suggestions, falling through to the
 * full /search page for anything beyond a quick pick.
 */
export function HeaderActions() {
  const cartCount = useCartItemCount();
  const wishlistCount = useWishlistCount();
  const { data: session } = useSession();
  const accountHref = session ? "/account" : "/sign-in";

  return (
    <div className="flex items-center gap-1">
      <HeaderSearch />
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
