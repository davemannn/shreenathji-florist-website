import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { ProductImportForm } from "@/features/product/components/product-import-form";
import { ExportButtons } from "@/components/shared/export-buttons";

export const metadata: Metadata = {
  title: "Import Products",
};

export default async function AdminProductImportPage() {
  await requireAdminSession("products:manage");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Import Products</h1>
          <p className="text-muted-foreground text-sm">
            Bulk-update price and stock from a spreadsheet.
          </p>
        </div>
        <ExportButtons href={(format) => `/api/admin/products/export?format=${format}`} />
      </div>

      <ProductImportForm />
    </div>
  );
}
