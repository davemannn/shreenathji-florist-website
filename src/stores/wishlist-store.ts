import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Denormalized like CartLineItem (src/stores/cart-store.ts) — enough of the
 * product's card data is stored here that /wishlist can render straight
 * from localStorage without a fresh DB round-trip, and can hand the default
 * variant straight to AddToCartButton.
 */
export interface WishlistItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  defaultVariantId: string;
  defaultVariantLabel: string;
  imageUrl?: string;
  imageAlt: string;
  rating: number;
  reviewCount: number;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, item],
          };
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "wishlist-storage" },
  ),
);

/** Hydration-safe item count for the header badge — same pattern as useCartItemCount. */
export function useWishlistCount(): number {
  const [hydrated, setHydrated] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHydrated(true), []);
  const count = useWishlistStore((state) => state.items.length);
  return hydrated ? count : 0;
}
