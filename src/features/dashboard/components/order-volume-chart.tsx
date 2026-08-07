"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { OrderVolumePoint } from "../types";

export function OrderVolumeChart({ data }: { data: OrderVolumePoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">No orders in this range.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={30} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="orders" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
