import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import {
  getCustomerReport,
  getProductReport,
  getSalesReport,
  getTaxReport,
} from "@/features/reports/queries";
import { resolveDateRange } from "@/features/reports/date-range";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "@/components/shared/summary-card";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Reports",
};

const TABS = [
  { value: "sales", label: "Sales" },
  { value: "tax", label: "Tax / GST" },
  { value: "products", label: "Products" },
  { value: "customers", label: "Customers" },
] as const;
type Tab = (typeof TABS)[number]["value"];

function ExportButtons({ type, from, to }: { type: Tab; from: string; to: string }) {
  const qs = (format: string) =>
    `/api/admin/reports/export?type=${type}&format=${format}&from=${from}&to=${to}`;
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" nativeButton={false} render={<a href={qs("csv")} />}>
        <Download className="size-3.5" aria-hidden="true" />
        CSV
      </Button>
      <Button variant="outline" size="sm" nativeButton={false} render={<a href={qs("xlsx")} />}>
        <Download className="size-3.5" aria-hidden="true" />
        Excel
      </Button>
    </div>
  );
}

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  await requireAdminSession("reports:view");

  const params = await searchParams;
  const tab: Tab = TABS.some((t) => t.value === params.tab) ? (params.tab as Tab) : "sales";
  const range = resolveDateRange({
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground text-sm">
          {range.fromIso} to {range.toIso}. Excludes cancelled orders.
        </p>
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="tab" value={tab} />
        <div>
          <Label htmlFor="from" className="mb-1 block text-xs">
            From
          </Label>
          <Input id="from" type="date" name="from" defaultValue={range.fromIso} className="w-40" />
        </div>
        <div>
          <Label htmlFor="to" className="mb-1 block text-xs">
            To
          </Label>
          <Input id="to" type="date" name="to" defaultValue={range.toIso} className="w-40" />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Apply
        </Button>
      </form>

      <nav className="flex gap-1.5" aria-label="Report type">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/admin/reports?tab=${t.value}&from=${range.fromIso}&to=${range.toIso}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              tab === t.value
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between">
        <div />
        <ExportButtons type={tab} from={range.fromIso} to={range.toIso} />
      </div>

      {tab === "sales" ? <SalesReportView range={range} /> : null}
      {tab === "tax" ? <TaxReportView range={range} /> : null}
      {tab === "products" ? <ProductsReportView range={range} /> : null}
      {tab === "customers" ? <CustomersReportView range={range} /> : null}
    </div>
  );
}

async function SalesReportView({ range }: { range: ReturnType<typeof resolveDateRange> }) {
  const report = await getSalesReport(range);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Orders" value={String(report.totalOrders)} />
        <SummaryCard label="Total Revenue" value={formatINR(report.totalRevenue)} />
        <SummaryCard label="Avg. Order Value" value={formatINR(report.avgOrderValue)} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground text-center">
                No orders in this range.
              </TableCell>
            </TableRow>
          ) : (
            report.rows.map((row) => (
              <TableRow key={row.period}>
                <TableCell>{row.period}</TableCell>
                <TableCell>{row.orders}</TableCell>
                <TableCell>{formatINR(row.revenue)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

async function TaxReportView({ range }: { range: ReturnType<typeof resolveDateRange> }) {
  const report = await getTaxReport(range);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="Taxable Value" value={formatINR(report.totalTaxableValue)} />
        <SummaryCard label="CGST" value={formatINR(report.totalCgst)} />
        <SummaryCard label="SGST" value={formatINR(report.totalSgst)} />
        <SummaryCard label="IGST" value={formatINR(report.totalIgst)} />
      </div>
      <p className="text-muted-foreground text-sm">
        Total tax collected:{" "}
        <span className="text-foreground font-semibold">{formatINR(report.totalTax)}</span>
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>GST Rate</TableHead>
            <TableHead>Taxable Value</TableHead>
            <TableHead>Tax Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.byRate.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground text-center">
                No taxed line items in this range.
              </TableCell>
            </TableRow>
          ) : (
            report.byRate.map((row) => (
              <TableRow key={row.gstRate}>
                <TableCell>{row.gstRate}%</TableCell>
                <TableCell>{formatINR(row.taxableValue)}</TableCell>
                <TableCell>{formatINR(row.taxAmount)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

async function ProductsReportView({ range }: { range: ReturnType<typeof resolveDateRange> }) {
  const rows = await getProductReport(range);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Units Sold</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-muted-foreground text-center">
              No products sold in this range.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.productTitle}>
              <TableCell>{row.productTitle}</TableCell>
              <TableCell>{row.unitsSold}</TableCell>
              <TableCell>{row.orderCount}</TableCell>
              <TableCell>{formatINR(row.revenue)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

async function CustomersReportView({ range }: { range: ReturnType<typeof resolveDateRange> }) {
  const report = await getCustomerReport(range);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard label="New Customers" value={String(report.newCustomerCount)} />
        <SummaryCard label="Repeat Customers" value={String(report.repeatCustomerCount)} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Orders (range)</TableHead>
            <TableHead>Spent (range)</TableHead>
            <TableHead>Lifetime Orders</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No customers ordered in this range.
              </TableCell>
            </TableRow>
          ) : (
            report.rows.map((row) => (
              <TableRow key={row.customerEmail}>
                <TableCell>
                  <div>{row.customerName}</div>
                  <div className="text-muted-foreground text-xs">{row.customerEmail}</div>
                </TableCell>
                <TableCell>{row.ordersInRange}</TableCell>
                <TableCell>{formatINR(row.totalSpentInRange)}</TableCell>
                <TableCell>{row.lifetimeOrderCount}</TableCell>
                <TableCell>
                  <Badge variant={row.isNewCustomer ? "secondary" : "outline"}>
                    {row.isNewCustomer ? "New" : "Repeat"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
