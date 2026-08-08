"use client";

import { useEffect, useRef, useState } from "react";

interface NotificationState {
  count: number;
  latestAt: string | null;
  /** True once the poll has seen a newer `latestAt` than whatever was current when this hook first mounted — i.e. something changed since this page loaded. */
  hasNewActivity: boolean;
}

const POLL_INTERVAL_MS = 25000;

/**
 * Polling, not SSE/WebSockets — see the admin panel plan's "Realtime"
 * section. 25s is a reasonable "realtime" bar for an admin dashboard
 * (not a chat app), and needs zero new infrastructure or dependencies.
 *
 * `onNewOrder` fires once per genuinely new `latestAt` value seen after
 * mount (never on the initial load, even if pending orders already
 * existed then) — a caller like AdminShell uses it to play a chime.
 * Deliberately not called from every consumer of this hook: multiple
 * mounts (e.g. the topbar badge AND the orders page's banner both calling
 * this hook) would each run their own poll/baseline independently, so a
 * chime callback is opt-in per call site to avoid firing twice for one order.
 */
export function useOrderNotifications(onNewOrder?: (latestAt: string) => void): NotificationState {
  const [state, setState] = useState<NotificationState>({
    count: 0,
    latestAt: null,
    hasNewActivity: false,
  });
  // undefined = haven't fetched yet; null = fetched, but nothing exists yet.
  const baselineLatestAt = useRef<string | null | undefined>(undefined);
  // Tracks the latest value already reported via onNewOrder, so a second
  // poll that still sees the same new order (nothing further has arrived)
  // doesn't re-fire the callback.
  const lastNotifiedAt = useRef<string | null>(null);
  const onNewOrderRef = useRef(onNewOrder);
  // Kept in sync via an effect, not a during-render assignment — the
  // latter is a React Compiler violation (refs may only be read/written
  // outside of render, e.g. here or inside the poll effect below).
  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  }, [onNewOrder]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/notifications", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data: { count: number; latestAt: string | null } = await res.json();
        if (cancelled) return;

        if (baselineLatestAt.current === undefined) {
          baselineLatestAt.current = data.latestAt;
        }

        const latestAt = data.latestAt;
        const isNew = latestAt !== null && latestAt !== baselineLatestAt.current;
        if (latestAt !== null && isNew && latestAt !== lastNotifiedAt.current) {
          lastNotifiedAt.current = latestAt;
          onNewOrderRef.current?.(latestAt);
        }

        setState({ count: data.count, latestAt: data.latestAt, hasNewActivity: isNew });
      } catch {
        // Network hiccup — ignore, the next poll retries. Not worth an error UI for a background badge.
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}
