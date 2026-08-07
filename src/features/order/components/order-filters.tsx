import Link from "next/link";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "../status-transitions";
import type { OrderStatus } from "../types";
import { OrderSearchInput } from "./order-search-input";

const STATUS_TABS: { label: string; value: OrderStatus | undefined }[] = [
  { label: "All", value: undefined },
  ...(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => ({
    label: ORDER_STATUS_LABELS[status],
    value: status,
  })),
];

/** Pure Link-based status tabs — URL is the source of truth, same pattern as the shop page's sort links. */
export function OrderFilters({ status, search }: { status?: OrderStatus; search?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex flex-wrap gap-1.5" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => {
          const params = new URLSearchParams();
          if (tab.value) params.set("status", tab.value);
          if (search) params.set("search", search);
          const href = params.toString() ? `/admin/orders?${params}` : "/admin/orders";
          const active = status === tab.value;
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                active
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <OrderSearchInput status={status} search={search} />
    </div>
  );
}
