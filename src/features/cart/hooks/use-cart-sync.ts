"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useCartStore } from "@/stores/cart-store";
import { syncCartSnapshotAction } from "../actions";

const SYNC_DEBOUNCE_MS = 2500;

/**
 * Mirrors the signed-in customer's client cart (zustand + localStorage) to
 * a `CartSnapshot` DB row on every change, debounced — feeds the admin
 * abandoned-cart report and (eventually) a recovery-email job. Signed-out
 * visitors are skipped entirely: a guest cart has no stable identity to
 * send a reminder to, which is exactly why this milestone scoped abandoned
 * carts to signed-in users only.
 *
 * Mount once, near the root of the storefront layout — it renders nothing.
 */
export function useCartSync() {
  const { data: session, isPending } = useSession();
  const items = useCartStore((state) => state.items);
  const [hydrated, setHydrated] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Same hydration-safety guard as useCartItemCount — the store's
  // localStorage-persisted items aren't reliable until after mount, so
  // syncing before then risks pushing a false "empty cart" that clobbers a
  // real snapshot from a previous session.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated || isPending || !session) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      void syncCartSnapshotAction({ items, subtotal });
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, hydrated, isPending, session]);
}
