import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLineItem {
  productId: string;
  productSlug: string;
  variantId: string;
  productTitle: string;
  variantLabel: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartLineItem[];
  addItem: (item: Omit<CartLineItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
}

/**
 * Client-side cart (zustand + localStorage persist), not a DB table — carts
 * are pre-order, ephemeral state; the real DB write happens at checkout.
 * Line items are keyed by variantId (not productId) since price/label vary
 * per variant.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((line) => line.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.variantId === item.variantId
                  ? { ...line, quantity: line.quantity + quantity }
                  : line,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((line) => line.variantId !== variantId) })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((line) => line.variantId !== variantId)
              : state.items.map((line) =>
                  line.variantId === variantId ? { ...line, quantity } : line,
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "cart-storage" },
  ),
);

/**
 * Guards against the classic zustand-persist + SSR hydration mismatch:
 * the server always renders 0 (no localStorage access), so the client's
 * *first* render must also report 0, even though the store has already
 * synchronously rehydrated from localStorage by then. Flips to the real
 * count only after mount, as a normal (non-hydration) re-render.
 */
export function useCartItemCount(): number {
  const [hydrated, setHydrated] = useState(false);
  // Deliberate exception to react-hooks/set-state-in-effect: this is the
  // standard "flip a flag after mount" hydration-safety pattern, not a
  // sync-external-state effect the rule is meant to catch — there's no
  // external event to await, mounting itself is the signal.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHydrated(true), []);
  const count = useCartStore((state) => state.items.reduce((sum, line) => sum + line.quantity, 0));
  return hydrated ? count : 0;
}
