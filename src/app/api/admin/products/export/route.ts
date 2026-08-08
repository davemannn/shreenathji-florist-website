import { NextResponse } from "next/server";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { listProductVariantRowsForExport } from "@/server/repositories/product.repository";
import { buildCsv, buildXlsx, downloadHeaders, type ReportColumn } from "@/server/reports/export";

// Header labels double as the column names the bulk-import parser
// recognizes (see features/product/import.ts's HEADER_ALIASES) — this file
// is meant to round-trip: export, edit Price/Stock, re-import.
const COLUMNS: ReportColumn[] = [
  { key: "slug", label: "Slug" },
  { key: "title", label: "Title" },
  { key: "variantLabel", label: "Variant" },
  { key: "price", label: "Price" },
  { key: "compareAtPrice", label: "Compare At Price" },
  { key: "stock", label: "Stock" },
  { key: "isActive", label: "Active" },
  { key: "categories", label: "Categories" },
];

export async function GET(request: Request) {
  try {
    await requireAdminCapability("products:manage");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const rows = await listProductVariantRowsForExport();
  const filename = `products-export-${new Date().toISOString().slice(0, 10)}`;

  if (format === "xlsx") {
    const buffer = await buildXlsx(
      "Products",
      COLUMNS,
      rows as unknown as Record<string, unknown>[],
    );
    return new NextResponse(new Uint8Array(buffer), { headers: downloadHeaders(filename, "xlsx") });
  }

  const csv = buildCsv(COLUMNS, rows as unknown as Record<string, unknown>[]);
  return new NextResponse(csv, { headers: downloadHeaders(filename, "csv") });
}
