import {
  getOrderStatusBreakdown,
  listDeliveredOrdersInRange,
  listOrdersInRange,
  type DateRangeParams,
} from "@/server/repositories/order.repository";
import { toIsoDate } from "@/lib/delivery";
import type { FinancialDashboard, OperationalDashboard } from "./types";

/** Visible to every staff role with dashboard access (including store_manager) — order counts only, never revenue. */
export async function getOperationalDashboard(
  range: DateRangeParams,
): Promise<OperationalDashboard> {
  const [orders, statusBreakdown, delivered] = await Promise.all([
    listOrdersInRange(range),
    getOrderStatusBreakdown(range),
    listDeliveredOrdersInRange(range),
  ]);

  const byDay = new Map<string, number>();
  for (const order of orders) {
    const day = toIsoDate(order.createdAt);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const orderVolume = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, count]) => ({ period, orders: count }));

  const fulfillmentHours = delivered.map(
    (o) => (o.deliveredAt!.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60),
  );
  const avgFulfillmentHours =
    fulfillmentHours.length > 0
      ? Math.round(
          (fulfillmentHours.reduce((sum, h) => sum + h, 0) / fulfillmentHours.length) * 10,
        ) / 10
      : null;

  return {
    orderVolume,
    statusBreakdown,
    totalOrders: orders.length,
    avgFulfillmentHours,
  };
}

/** Super Admin/Admin only (analytics:view:financial) — revenue figures. */
export async function getFinancialDashboard(range: DateRangeParams): Promise<FinancialDashboard> {
  const orders = await listOrdersInRange(range);

  const byDay = new Map<string, number>();
  for (const order of orders) {
    const day = toIsoDate(order.createdAt);
    byDay.set(day, (byDay.get(day) ?? 0) + order.total);
  }
  const revenueTrend = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, revenue]) => ({ period, revenue }));

  const byProduct = new Map<string, { revenue: number; unitsSold: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const bucket = byProduct.get(item.productTitle) ?? { revenue: 0, unitsSold: 0 };
      bucket.revenue += item.lineTotal;
      bucket.unitsSold += item.quantity;
      byProduct.set(item.productTitle, bucket);
    }
  }
  const topProducts = Array.from(byProduct.entries())
    .map(([productTitle, bucket]) => ({ productTitle, ...bucket }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return {
    revenueTrend,
    totalRevenue,
    avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
    topProducts,
  };
}
