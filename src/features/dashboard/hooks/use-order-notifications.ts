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
 */
export function useOrderNotifications(): NotificationState {
  const [state, setState] = useState<NotificationState>({
    count: 0,
    latestAt: null,
    hasNewActivity: false,
  });
  // undefined = haven't fetched yet; null = fetched, but nothing exists yet.
  const baselineLatestAt = useRef<string | null | undefined>(undefined);

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

        setState({
          count: data.count,
          latestAt: data.latestAt,
          hasNewActivity: data.latestAt !== null && data.latestAt !== baselineLatestAt.current,
        });
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
