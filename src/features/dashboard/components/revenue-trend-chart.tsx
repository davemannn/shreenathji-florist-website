"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatINR } from "@/lib/format";
import type { RevenueTrendPoint } from "../types";

export function RevenueTrendChart({ data }: { data: RevenueTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">No revenue in this range.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={(v: number) => `₹${v}`} />
        <Tooltip formatter={(value) => formatINR(Number(value))} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-brand)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
