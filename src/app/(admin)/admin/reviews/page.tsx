import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listReviewsAdmin } from "@/features/review/queries";
import { ReviewsTable } from "@/features/review/components/reviews-table";
import { Pagination } from "@/components/shared/pagination";
import { PAGE_SIZE_OPTIONS, parsePageSize } from "@/lib/pagination";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reviews",
};

const STATUS_TABS = [
  { label: "All", value: undefined },
  { label: "Pending", value: "pending" as const },
  { label: "Approved", value: "approved" as const },
];

export default async function AdminReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  await requireAdminSession("reviews:moderate");

  const params = await searchParams;
  const rawStatus = typeof params.status === "string" ? params.status : undefined;
  const status = rawStatus === "pending" || rawStatus === "approved" ? rawStatus : undefined;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const pageSize = parsePageSize(params.pageSize);

  const {
    reviews,
    total,
    pageSize: resolvedPageSize,
  } = await listReviewsAdmin({
    status,
    page,
    pageSize,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="text-muted-foreground text-sm">{total} reviews</p>
      </div>

      <nav className="flex gap-1.5" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => {
          const href = tab.value ? `/admin/reviews?status=${tab.value}` : "/admin/reviews";
          const active = status === tab.value;
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                active
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <ReviewsTable reviews={reviews} />
      <Pagination
        basePath="/admin/reviews"
        page={page}
        pageSize={resolvedPageSize}
        total={total}
        extraParams={{ status }}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
      />
    </div>
  );
}
