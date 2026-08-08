import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listOrdersAdmin } from "@/features/order/queries";
import { OrderFilters } from "@/features/order/components/order-filters";
import { OrdersTable } from "@/features/order/components/orders-table";
import { NewActivityBanner } from "@/features/dashboard/components/new-activity-banner";
import { Pagination } from "@/components/shared/pagination";
import { PAGE_SIZE_OPTIONS, parsePageSize } from "@/lib/pagination";
import type { OrderStatus } from "@/features/order/types";

export const metadata: Metadata = {
  title: "Orders",
};

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdminSession("orders:view:all");

  const params = await searchParams;
  const rawStatus = typeof params.status === "string" ? params.status : undefined;
  const status = VALID_STATUSES.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const pageSize = parsePageSize(params.pageSize);

  const {
    orders,
    total,
    pageSize: resolvedPageSize,
  } = await listOrdersAdmin({
    status,
    search,
    page,
    pageSize,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-muted-foreground text-sm">{total} orders</p>
      </div>

      <NewActivityBanner label="New orders have come in." />
      <OrderFilters status={status} search={search} />
      <OrdersTable orders={orders} />
      <Pagination
        basePath="/admin/orders"
        page={page}
        pageSize={resolvedPageSize}
        total={total}
        extraParams={{ status, search }}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
      />
    </div>
  );
}
