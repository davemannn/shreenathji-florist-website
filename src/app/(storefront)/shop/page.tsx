import type { Metadata } from "next";
import { listShopProducts, type ShopProductListParams } from "@/features/product/queries";
import { listAllCategories } from "@/features/category/queries";
import { ProductGrid } from "@/features/product/components/product-grid";
import { SortLinks } from "@/features/product/components/sort-links";
import { CategorySidebar } from "@/features/category/components/category-sidebar";
import { Pagination } from "@/components/shared/pagination";
import type { ProductSort } from "@/server/repositories/product.repository";

export const metadata: Metadata = {
  title: "Shop All",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const sort = typeof params.sort === "string" ? (params.sort as ProductSort) : undefined;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;

  const [{ products, total, pageSize }, categories] = await Promise.all([
    listShopProducts({ sort, page } satisfies ShopProductListParams),
    listAllCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="text-3xl md:text-4xl">Shop All</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <CategorySidebar categories={categories} />
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">{total} products</p>
            <SortLinks basePath="/shop" currentSort={sort} />
          </div>
          <ProductGrid products={products} />
          <Pagination
            basePath="/shop"
            page={page}
            pageSize={pageSize}
            total={total}
            extraParams={{ sort }}
          />
        </div>
      </div>
    </div>
  );
}
