import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listProductsAdmin, type AdminProductSort } from "@/features/product/queries";
import { ProductsTable } from "@/features/product/components/products-table";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { ExportButtons } from "@/components/shared/export-buttons";
import { PAGE_SIZE_OPTIONS, parsePageSize } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Products",
};

const SORT_KEYS: AdminProductSort[] = ["title", "price", "stock", "status"];

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdminSession("products:manage");

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const rawSort = typeof params.sort === "string" ? params.sort : undefined;
  const sort = SORT_KEYS.find((key) => key === rawSort);
  const dir = params.dir === "desc" ? "desc" : "asc";
  const pageSize = parsePageSize(params.pageSize);

  const {
    products,
    total,
    pageSize: resolvedPageSize,
  } = await listProductsAdmin({
    search,
    page,
    pageSize,
    sort,
    dir,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm">{total} products</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons href={(format) => `/api/admin/products/export?format=${format}`} />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/products/import" />}
          >
            <Upload className="size-3.5" aria-hidden="true" />
            Import
          </Button>
          <Button variant="brand" nativeButton={false} render={<Link href="/admin/products/new" />}>
            <Plus className="size-4" aria-hidden="true" />
            New Product
          </Button>
        </div>
      </div>

      <SearchInput basePath="/admin/products" search={search} placeholder="Search products…" />
      <ProductsTable products={products} sort={sort} dir={dir} search={search} />
      <Pagination
        basePath="/admin/products"
        page={page}
        pageSize={resolvedPageSize}
        total={total}
        extraParams={{ search, sort, dir }}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
      />
    </div>
  );
}
