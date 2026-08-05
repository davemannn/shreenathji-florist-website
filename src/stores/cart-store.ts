import { create } from "zustand";

interface CartState {
  itemCount: number;
  add: () => void;
}

// STUB — full cart state (line items, quantities, totals, remove/update
// actions) is its own future milestone. "Add" just increments a count so the
// header badge and toast feedback are provably wired end to end.
export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  add: () => set((state) => ({ itemCount: state.itemCount + 1 })),
}));
