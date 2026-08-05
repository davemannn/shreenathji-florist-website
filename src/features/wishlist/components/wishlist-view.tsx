"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/stores/wishlist-store";
import { WishlistItemCard } from "./wishlist-item-card";

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <Heart className="text-muted-foreground size-10" aria-hidden="true" />
      <div>
        <p className="font-medium">Your wishlist is empty</p>
        <p className="text-muted-foreground text-sm">
          Tap the heart on anything you love to save it here.
        </p>
      </div>
      <Button variant="brand" nativeButton={false} render={<Link href="/shop" />}>
        Start Shopping
      </Button>
    </div>
  );
}

export function WishlistView() {
  const items = useWishlistStore((state) => state.items);
  const [hydrated, setHydrated] = useState(false);
  // Same hydration-safety pattern as CartView — wishlist state is localStorage-backed.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;
  if (items.length === 0) return <EmptyWishlist />;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <WishlistItemCard key={item.productId} item={item} />
      ))}
    </div>
  );
}
