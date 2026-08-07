import { NextResponse } from "next/server";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  getCustomerReport,
  getProductReport,
  getSalesReport,
  getTaxReport,
} from "@/features/reports/queries";
import { resolveDateRange } from "@/features/reports/date-range";
import { buildCsv, buildXlsx, downloadHeaders, type ReportColumn } from "@/server/reports/export";

const REPORT_TYPES = ["sales", "tax", "products", "customers"] as const;
type ReportType = (typeof REPORT_TYPES)[number];

const COLUMNS: Record<ReportType, ReportColumn[]> = {
  sales: [
    { key: "period", label: "Date" },
    { key: "orders", label: "Orders" },
    { key: "revenue", label: "Revenue (₹)" },
  ],
  tax: [
    { key: "gstRate", label: "GST Rate (%)" },
    { key: "taxableValue", label: "Taxable Value (₹)" },
    { key: "taxAmount", label: "Tax Amount (₹)" },
  ],
  products: [
    { key: "productTitle", label: "Product" },
    { key: "unitsSold", label: "Units Sold" },
    { key: "orderCount", label: "Orders" },
    { key: "revenue", label: "Revenue (₹)" },
  ],
  customers: [
    { key: "customerName", label: "Customer" },
    { key: "customerEmail", label: "Email" },
    { key: "ordersInRange", label: "Orders (in range)" },
    { key: "totalSpentInRange", label: "Spent (₹, in range)" },
    { key: "lifetimeOrderCount", label: "Lifetime Orders" },
    { key: "isNewCustomer", label: "New Customer?" },
  ],
};

async function getRows(type: ReportType, range: ReturnType<typeof resolveDateRange>) {
  switch (type) {
    case "sales":
      return (await getSalesReport(range)).rows;
    case "tax":
      return (await getTaxReport(range)).byRate;
    case "products":
      return getProductReport(range);
    case "customers":
      return (await getCustomerReport(range)).rows;
  }
}

export async function GET(request: Request) {
  try {
    await requireAdminCapability("reports:view");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ReportType | null;
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  if (!type || !REPORT_TYPES.includes(type)) {
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }

  const range = resolveDateRange({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const rows = await getRows(type, range);
  const columns = COLUMNS[type];
  const filename = `${type}-report-${range.fromIso}-to-${range.toIso}`;

  if (format === "xlsx") {
    const buffer = await buildXlsx(type, columns, rows as unknown as Record<string, unknown>[]);
    return new NextResponse(new Uint8Array(buffer), { headers: downloadHeaders(filename, "xlsx") });
  }

  const csv = buildCsv(columns, rows as unknown as Record<string, unknown>[]);
  return new NextResponse(csv, { headers: downloadHeaders(filename, "csv") });
}
