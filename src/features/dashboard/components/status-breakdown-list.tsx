import { Badge } from "@/components/ui/badge";
import type { StatusBreakdownRow } from "../types";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function StatusBreakdownList({ rows }: { rows: StatusBreakdownRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">No orders in this range.</p>
    );
  }

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li key={row.status} className="flex items-center justify-between text-sm">
          <Badge variant={row.status === "CANCELLED" ? "destructive" : "outline"}>
            {STATUS_LABEL[row.status] ?? row.status}
          </Badge>
          <span>
            {row.count}{" "}
            <span className="text-muted-foreground text-xs">
              ({total > 0 ? Math.round((row.count / total) * 100) : 0}%)
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
