import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/server/auth/require-admin";
import { can } from "@/server/auth/permissions";
import { getFinancialDashboard, getOperationalDashboard } from "@/features/dashboard/queries";
import { resolveDateRange } from "@/features/reports/date-range";
import { RevenueTrendChart } from "@/features/dashboard/components/revenue-trend-chart";
import { OrderVolumeChart } from "@/features/dashboard/components/order-volume-chart";
import { StatusBreakdownList } from "@/features/dashboard/components/status-breakdown-list";
import { TopProductsList } from "@/features/dashboard/components/top-products-list";
import { SummaryCard } from "@/components/shared/summary-card";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const session = await requireAdminSession("analytics:view:operational");
  const seesFinancials = can(session.role, "analytics:view:financial");

  const range = resolveDateRange({});
  const operational = await getOperationalDashboard(range);
  const financial = seesFinancials ? await getFinancialDashboard(range) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Last 30 days ({range.fromIso} to {range.toIso}) · Signed in as {session.name}
          </p>
        </div>
        <Link href="/admin/reports" className="text-brand text-sm hover:underline">
          View full reports →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Orders" value={String(operational.totalOrders)} />
        <SummaryCard
          label="Avg. Fulfillment"
          value={
            operational.avgFulfillmentHours != null ? `${operational.avgFulfillmentHours}h` : "—"
          }
        />
        {financial ? (
          <>
            <SummaryCard label="Revenue" value={formatINR(financial.totalRevenue)} />
            <SummaryCard label="Avg. Order Value" value={formatINR(financial.avgOrderValue)} />
          </>
        ) : null}
      </div>

      {financial ? (
        <section className="border-border rounded-md border p-5">
          <h2 className="mb-4 font-semibold">Revenue Trend</h2>
          <RevenueTrendChart data={financial.revenueTrend} />
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border-border rounded-md border p-5">
          <h2 className="mb-4 font-semibold">Order Volume</h2>
          <OrderVolumeChart data={operational.orderVolume} />
        </section>
        <section className="border-border rounded-md border p-5">
          <h2 className="mb-4 font-semibold">Order Status Breakdown</h2>
          <StatusBreakdownList rows={operational.statusBreakdown} />
        </section>
      </div>

      {financial ? (
        <section className="border-border rounded-md border p-5">
          <h2 className="mb-4 font-semibold">Top Products</h2>
          <TopProductsList products={financial.topProducts} />
        </section>
      ) : null}

      {!seesFinancials ? (
        <p className="text-muted-foreground text-xs">
          Revenue and financial figures aren&rsquo;t shown for your role — see an admin for those.
        </p>
      ) : null}
    </div>
  );
}
