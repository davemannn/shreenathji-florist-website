import { create } from "zustand";

interface WishlistState {
  productIds: Set<string>;
  toggle: (id: string) => void;
}

// STUB — persistence, syncing with a real account, etc. are future
// milestones. This is enough to make the header badge and per-card heart
// icon behave correctly against each other for now.
export const useWishlistStore = create<WishlistState>((set) => ({
  productIds: new Set(),
  toggle: (id) =>
    set((state) => {
      const next = new Set(state.productIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { productIds: next };
    }),
}));
