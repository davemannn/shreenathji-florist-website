import {
  getCustomerLifetimeStats,
  listOrdersInRange,
  type DateRangeParams,
} from "@/server/repositories/order.repository";
import { toIsoDate } from "@/lib/delivery";
import type { CustomerReport, ProductReportRow, SalesReport, TaxReport } from "./types";

export type ReportDateRange = DateRangeParams;

async function fetchOrders(range: ReportDateRange) {
  return listOrdersInRange(range);
}

/** Grouped by IST calendar day — fine-grained enough for a 30-90 day window; the report page can always sum multiple rows itself for a coarser view. */
export async function getSalesReport(range: ReportDateRange): Promise<SalesReport> {
  const orders = await fetchOrders(range);

  const byDay = new Map<string, { orders: number; revenue: number }>();
  for (const order of orders) {
    const day = toIsoDate(order.createdAt);
    const bucket = byDay.get(day) ?? { orders: 0, revenue: 0 };
    bucket.orders += 1;
    bucket.revenue += order.total;
    byDay.set(day, bucket);
  }

  const rows = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, bucket]) => ({ period, orders: bucket.orders, revenue: bucket.revenue }));

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return {
    rows,
    totalOrders,
    totalRevenue,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
  };
}

/** The numbers you'd hand to your accountant for GST filing — total tax collected, split by rate slab. */
export async function getTaxReport(range: ReportDateRange): Promise<TaxReport> {
  const orders = await fetchOrders(range);

  const byRate = new Map<number, { taxableValue: number; taxAmount: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const bucket = byRate.get(item.gstRate) ?? { taxableValue: 0, taxAmount: 0 };
      bucket.taxableValue += item.taxableValue;
      bucket.taxAmount += item.taxAmount;
      byRate.set(item.gstRate, bucket);
    }
  }

  return {
    totalTaxableValue: orders.reduce((sum, o) => sum + o.taxableValue, 0),
    totalCgst: orders.reduce((sum, o) => sum + o.cgstAmount, 0),
    totalSgst: orders.reduce((sum, o) => sum + o.sgstAmount, 0),
    totalIgst: orders.reduce((sum, o) => sum + o.igstAmount, 0),
    totalTax: orders.reduce((sum, o) => sum + o.totalTax, 0),
    byRate: Array.from(byRate.entries())
      .sort(([a], [b]) => a - b)
      .map(([gstRate, bucket]) => ({ gstRate, ...bucket })),
  };
}

export async function getProductReport(range: ReportDateRange): Promise<ProductReportRow[]> {
  const orders = await fetchOrders(range);

  const byProduct = new Map<
    string,
    { unitsSold: number; revenue: number; orderIds: Set<string> }
  >();
  for (const order of orders) {
    for (const item of order.items) {
      const bucket = byProduct.get(item.productTitle) ?? {
        unitsSold: 0,
        revenue: 0,
        orderIds: new Set<string>(),
      };
      bucket.unitsSold += item.quantity;
      bucket.revenue += item.lineTotal;
      bucket.orderIds.add(order.id);
      byProduct.set(item.productTitle, bucket);
    }
  }

  return Array.from(byProduct.entries())
    .map(([productTitle, bucket]) => ({
      productTitle,
      unitsSold: bucket.unitsSold,
      revenue: bucket.revenue,
      orderCount: bucket.orderIds.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getCustomerReport(range: ReportDateRange): Promise<CustomerReport> {
  const [orders, lifetimeStats] = await Promise.all([
    fetchOrders(range),
    getCustomerLifetimeStats(),
  ]);

  const byCustomer = new Map<
    string,
    { name: string; email: string; orders: number; spent: number }
  >();
  for (const order of orders) {
    const bucket = byCustomer.get(order.userId) ?? {
      name: order.user.name,
      email: order.user.email,
      orders: 0,
      spent: 0,
    };
    bucket.orders += 1;
    bucket.spent += order.total;
    byCustomer.set(order.userId, bucket);
  }

  const rangeStartMs = range.from.getTime();
  const rows = Array.from(byCustomer.entries())
    .map(([userId, bucket]) => {
      const lifetime = lifetimeStats.get(userId);
      // "New" = their very first-ever order falls inside this report's
      // range — a customer who ordered before the range started, even if
      // they also ordered again inside it, is a repeat customer.
      const isNewCustomer = (lifetime?.firstOrderAt.getTime() ?? rangeStartMs) >= rangeStartMs;
      return {
        customerName: bucket.name,
        customerEmail: bucket.email,
        ordersInRange: bucket.orders,
        totalSpentInRange: bucket.spent,
        isNewCustomer,
        lifetimeOrderCount: lifetime?.lifetimeOrderCount ?? bucket.orders,
      };
    })
    .sort((a, b) => b.totalSpentInRange - a.totalSpentInRange);

  return {
    rows,
    newCustomerCount: rows.filter((r) => r.isNewCustomer).length,
    repeatCustomerCount: rows.filter((r) => !r.isNewCustomer).length,
  };
}
