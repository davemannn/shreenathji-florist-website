import { NextResponse } from "next/server";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { listCustomersAdmin } from "@/features/customer/queries";
import { buildCsv, buildXlsx, downloadHeaders, type ReportColumn } from "@/server/reports/export";

const COLUMNS: ReportColumn[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "segment", label: "Segment" },
  { key: "lifetimeOrderCount", label: "Lifetime Orders" },
  { key: "lifetimeSpent", label: "Lifetime Spent (₹)" },
  { key: "tags", label: "Tags" },
  { key: "joinedAt", label: "Joined" },
];

export async function GET(request: Request) {
  try {
    await requireAdminCapability("customers:view");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  // No pagination — a florist's customer list is small enough to export in
  // one shot; a page-sized limit here would silently truncate the file.
  const { customers } = await listCustomersAdmin({ pageSize: 1_000_000 });
  const rows = customers.map((c) => ({
    ...c,
    tags: c.tags.join("; "),
    joinedAt: c.joinedAt.slice(0, 10),
  }));
  const filename = `customers-export-${new Date().toISOString().slice(0, 10)}`;

  if (format === "xlsx") {
    const buffer = await buildXlsx(
      "Customers",
      COLUMNS,
      rows as unknown as Record<string, unknown>[],
    );
    return new NextResponse(new Uint8Array(buffer), { headers: downloadHeaders(filename, "xlsx") });
  }

  const csv = buildCsv(COLUMNS, rows as unknown as Record<string, unknown>[]);
  return new NextResponse(csv, { headers: downloadHeaders(filename, "csv") });
}
