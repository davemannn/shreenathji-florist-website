import type { Metadata } from "next";
import { listShopProducts, type ShopProductListParams } from "@/features/product/queries";
import { listAllCategories } from "@/features/category/queries";
import { ProductGrid } from "@/features/product/components/product-grid";
import { SortLinks } from "@/features/product/components/sort-links";
import { PriceFilter } from "@/features/product/components/price-filter";
import { ActiveFilters } from "@/features/product/components/active-filters";
import { MobileFilterDrawer } from "@/features/product/components/mobile-filter-drawer";
import { CategorySidebar } from "@/features/category/components/category-sidebar";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Pagination } from "@/components/shared/pagination";
import type { ProductSort } from "@/server/repositories/product.repository";

export const metadata: Metadata = {
  title: "Shop All",
};

const SORT_LABELS: Record<string, string> = {
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const sort = typeof params.sort === "string" ? (params.sort as ProductSort) : undefined;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;

  const [{ products, total, pageSize }, categories] = await Promise.all([
    listShopProducts({ sort, page, minPrice, maxPrice } satisfies ShopProductListParams),
    listAllCategories(),
  ]);

  const extraParams = {
    sort,
    minPrice: minPrice !== undefined ? String(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? String(maxPrice) : undefined,
  };

  const chips = [
    sort
      ? {
          label: `Sort: ${SORT_LABELS[sort] ?? sort}`,
          removeHref: buildHref({ minPrice, maxPrice }),
        }
      : null,
    minPrice !== undefined || maxPrice !== undefined
      ? {
          label:
            minPrice !== undefined && maxPrice !== undefined
              ? `₹${minPrice} – ₹${maxPrice}`
              : minPrice !== undefined
                ? `₹${minPrice}+`
                : `Under ₹${maxPrice}`,
          removeHref: buildHref({ sort }),
        }
      : null,
  ].filter((chip): chip is NonNullable<typeof chip> => chip !== null);

  function buildHref(kept: { sort?: ProductSort; minPrice?: number; maxPrice?: number }) {
    const p = new URLSearchParams();
    if (kept.sort) p.set("sort", kept.sort);
    if (kept.minPrice !== undefined) p.set("minPrice", String(kept.minPrice));
    if (kept.maxPrice !== undefined) p.set("maxPrice", String(kept.maxPrice));
    const qs = p.toString();
    return qs ? `/shop?${qs}` : "/shop";
  }

  const sidebarContent = (
    <>
      <CategorySidebar categories={categories} />
      <PriceFilter
        basePath="/shop"
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        extraParams={{ sort }}
      />
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop All" }]} />
      <h1 className="text-3xl md:text-4xl">Shop All</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden flex-col gap-8 lg:flex">{sidebarContent}</aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MobileFilterDrawer>{sidebarContent}</MobileFilterDrawer>
              <p className="text-muted-foreground text-sm">{total} products</p>
            </div>
            <SortLinks basePath="/shop" currentSort={sort} extraParams={extraParams} />
          </div>
          <ActiveFilters chips={chips} clearAllHref="/shop" />
          <ProductGrid products={products} />
          <Pagination
            basePath="/shop"
            page={page}
            pageSize={pageSize}
            total={total}
            extraParams={extraParams}
          />
        </div>
      </div>
    </div>
  );
}
