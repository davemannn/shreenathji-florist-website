"use client";

import { useCartSync } from "../hooks/use-cart-sync";

/** Renders nothing — just mounts the cart→CartSnapshot sync hook once near the root of the storefront layout. */
export function CartSyncListener() {
  useCartSync();
  return null;
}
