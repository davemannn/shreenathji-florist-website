// The cart's actual state types (CartLineItem, AppliedCoupon) live with the
// store itself (src/stores/cart-store.ts) since they're inseparable from its
// persisted shape — re-exported here so feature-folder imports still work.
export type { CartLineItem, AppliedCoupon } from "@/stores/cart-store";
