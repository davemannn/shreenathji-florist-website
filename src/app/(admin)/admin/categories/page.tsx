import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import {
  listCategoriesAdmin,
  listCategoriesAdminPaginated,
  type AdminCategorySort,
} from "@/features/category/queries";
import { CategoriesTable } from "@/features/category/components/categories-table";
import { ReorderCategoriesDialog } from "@/features/category/components/reorder-categories-dialog";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { PAGE_SIZE_OPTIONS, parsePageSize } from "@/lib/pagination";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Categories",
};

const SORT_KEYS: AdminCategorySort[] = ["name", "products", "flags"];

export default async function AdminCategoriesPage({
  searchParams,
}: PageProps<"/admin/categories">) {
  await requireAdminSession("categories:manage");

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const rawSort = typeof params.sort === "string" ? params.sort : undefined;
  const sort = SORT_KEYS.find((key) => key === rawSort);
  const dir = params.dir === "desc" ? "desc" : "asc";
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const pageSize = parsePageSize(params.pageSize);

  const [{ categories, total, pageSize: resolvedPageSize }, categoriesInOrder] = await Promise.all([
    listCategoriesAdminPaginated({ search, sort, dir, page, pageSize }),
    // Always the full, unfiltered catalog in its real sortOrder — reordering
    // a search-filtered/paginated subset would silently drop the rest out
    // of order.
    listCategoriesAdmin(),
  ]);
  const fullOrderedList = categoriesInOrder;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-muted-foreground text-sm">{total} categories</p>
        </div>
        <div className="flex items-center gap-2">
          <ReorderCategoriesDialog categories={fullOrderedList} />
          <Button
            variant="brand"
            nativeButton={false}
            render={<Link href="/admin/categories/new" />}
          >
            <Plus className="size-4" aria-hidden="true" />
            New Category
          </Button>
        </div>
      </div>

      <SearchInput basePath="/admin/categories" search={search} placeholder="Search categories…" />

      <CategoriesTable categories={categories} sort={sort} dir={dir} search={search} />
      <Pagination
        basePath="/admin/categories"
        page={page}
        pageSize={resolvedPageSize}
        total={total}
        extraParams={{ search, sort, dir }}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
      />
    </div>
  );
}
