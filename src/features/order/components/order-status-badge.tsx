import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "../status-transitions";
import type { OrderStatus } from "../types";

// badge.tsx only ships default/secondary/destructive/outline/ghost/link —
// no semantic success/warning variants, so status colors are applied here
// as className overrides on top of "outline" rather than adding one-off
// variants to a shared primitive for a single feature's use.
const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  CONFIRMED:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  PROCESSING:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-400",
  OUT_FOR_DELIVERY:
    "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-400",
  DELIVERED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  CANCELLED: "border-border bg-muted text-muted-foreground",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status], className)}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
