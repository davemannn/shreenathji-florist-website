"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderNotifications } from "../hooks/use-order-notifications";

/**
 * Shown on /admin/orders and /admin/my-deliveries — doesn't silently mutate
 * the list out from under someone mid-task (e.g. filling in a status note),
 * just surfaces that something changed and lets them choose to refresh.
 * router.refresh() re-runs the server component against the current URL,
 * so any active filters/sort/page are preserved.
 */
export function NewActivityBanner({ label }: { label: string }) {
  const router = useRouter();
  const { hasNewActivity } = useOrderNotifications();

  if (!hasNewActivity) return null;

  return (
    <div className="bg-brand/10 border-brand/20 flex items-center justify-between gap-3 rounded-xs border px-4 py-2.5 text-sm">
      <span className="text-brand font-medium">{label}</span>
      <Button variant="brand" size="sm" onClick={() => router.refresh()}>
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Refresh
      </Button>
    </div>
  );
}
