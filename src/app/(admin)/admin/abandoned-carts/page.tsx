import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listAbandonedCartsAdmin } from "@/features/abandoned-cart/queries";
import { AbandonedCartsTable } from "@/features/abandoned-cart/components/abandoned-carts-table";
import { Pagination } from "@/components/shared/pagination";
import { PAGE_SIZE_OPTIONS, parsePageSize } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Abandoned Carts",
};

export default async function AbandonedCartsPage({
  searchParams,
}: PageProps<"/admin/abandoned-carts">) {
  await requireAdminSession("customers:view");

  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const pageSize = parsePageSize(params.pageSize);

  const {
    carts,
    total,
    pageSize: resolvedPageSize,
  } = await listAbandonedCartsAdmin({
    page,
    pageSize,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Abandoned Carts</h1>
        <p className="text-muted-foreground text-sm">
          {total} signed-in customer{total === 1 ? "" : "s"} with items sitting in their cart for
          over an hour.
        </p>
      </div>

      <AbandonedCartsTable carts={carts} />

      <Pagination
        basePath="/admin/abandoned-carts"
        page={page}
        pageSize={resolvedPageSize}
        total={total}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
      />
    </div>
  );
}
