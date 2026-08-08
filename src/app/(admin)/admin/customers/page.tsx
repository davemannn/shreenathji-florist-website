import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listCustomersAdmin } from "@/features/customer/queries";
import { CustomersTable } from "@/features/customer/components/customers-table";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { PAGE_SIZE_OPTIONS, parsePageSize } from "@/lib/pagination";
import { ExportButtons } from "@/components/shared/export-buttons";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdminSession("customers:view");

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const pageSize = parsePageSize(params.pageSize);

  const {
    customers,
    total,
    pageSize: resolvedPageSize,
  } = await listCustomersAdmin({
    search,
    page,
    pageSize,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-muted-foreground text-sm">{total} customers</p>
        </div>
        <ExportButtons href={(format) => `/api/admin/customers/export?format=${format}`} />
      </div>

      <SearchInput
        basePath="/admin/customers"
        search={search}
        placeholder="Name, email, or phone…"
      />

      <CustomersTable customers={customers} />

      <Pagination
        basePath="/admin/customers"
        page={page}
        pageSize={resolvedPageSize}
        total={total}
        extraParams={{ search }}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
      />
    </div>
  );
}
