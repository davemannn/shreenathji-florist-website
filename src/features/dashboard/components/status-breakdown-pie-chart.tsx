"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusBreakdownRow } from "../types";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// Reuses the theme's chart-1..5 palette (see globals.css) so this matches
// the Revenue Trend / Order Volume charts elsewhere on the dashboard;
// Cancelled borrows the destructive color instead, same as the old list's
// badge variant did — a cancelled slice should read as "bad news" at a glance.
const STATUS_COLOR: Record<string, string> = {
  PENDING: "var(--color-chart-1)",
  CONFIRMED: "var(--color-chart-2)",
  PROCESSING: "var(--color-chart-3)",
  OUT_FOR_DELIVERY: "var(--color-chart-4)",
  DELIVERED: "var(--color-chart-5)",
  CANCELLED: "var(--color-destructive)",
};

export function StatusBreakdownPieChart({ rows }: { rows: StatusBreakdownRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">No orders in this range.</p>
    );
  }

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ResponsiveContainer width="100%" height={220} className="sm:max-w-[220px]">
        <PieChart>
          <Pie
            data={rows}
            dataKey="count"
            nameKey="status"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {rows.map((row) => (
              <Cell key={row.status} fill={STATUS_COLOR[row.status] ?? "var(--color-muted)"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, entry) => {
              const numericValue = Number(value ?? 0);
              const status = String(entry.payload?.status ?? "");
              return [
                `${numericValue} (${total > 0 ? Math.round((numericValue / total) * 100) : 0}%)`,
                STATUS_LABEL[status] ?? status,
              ];
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="flex flex-1 flex-col gap-2">
        {rows.map((row) => (
          <li key={row.status} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[row.status] ?? "var(--color-muted)" }}
                aria-hidden="true"
              />
              {STATUS_LABEL[row.status] ?? row.status}
            </span>
            <span>
              {row.count}{" "}
              <span className="text-muted-foreground text-xs">
                ({total > 0 ? Math.round((row.count / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
