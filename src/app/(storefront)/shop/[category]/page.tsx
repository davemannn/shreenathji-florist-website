import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listShopProducts } from "@/features/product/queries";
import { getCategoryBySlug, listAllCategories } from "@/features/category/queries";
import { ProductGrid } from "@/features/product/components/product-grid";
import { SortLinks } from "@/features/product/components/sort-links";
import { PriceFilter } from "@/features/product/components/price-filter";
import { ActiveFilters } from "@/features/product/components/active-filters";
import { MobileFilterDrawer } from "@/features/product/components/mobile-filter-drawer";
import { CategorySidebar } from "@/features/category/components/category-sidebar";
import { CategoryHeader } from "@/features/category/components/category-header";
import { Pagination } from "@/components/shared/pagination";
import type { ProductSort } from "@/server/repositories/product.repository";

export async function generateMetadata({
  params,
}: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Shop" };
}

const SORT_LABELS: Record<string, string> = {
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
};

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/shop/[category]">) {
  const { category: categorySlug } = await params;
  const sp = await searchParams;
  const sort = typeof sp.sort === "string" ? (sp.sort as ProductSort) : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) || 1 : 1;
  const minPrice = typeof sp.minPrice === "string" ? Number(sp.minPrice) : undefined;
  const maxPrice = typeof sp.maxPrice === "string" ? Number(sp.maxPrice) : undefined;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const [{ products, total, pageSize }, categories] = await Promise.all([
    listShopProducts({ categorySlug, sort, page, minPrice, maxPrice }),
    listAllCategories(),
  ]);

  const basePath = `/shop/${categorySlug}`;
  const extraParams = {
    sort,
    minPrice: minPrice !== undefined ? String(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? String(maxPrice) : undefined,
  };

  function buildHref(kept: { sort?: ProductSort; minPrice?: number; maxPrice?: number }) {
    const p = new URLSearchParams();
    if (kept.sort) p.set("sort", kept.sort);
    if (kept.minPrice !== undefined) p.set("minPrice", String(kept.minPrice));
    if (kept.maxPrice !== undefined) p.set("maxPrice", String(kept.maxPrice));
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

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

  const sidebarContent = (
    <>
      <CategorySidebar categories={categories} activeSlug={categorySlug} />
      <PriceFilter
        basePath={basePath}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        extraParams={{ sort }}
      />
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <CategoryHeader category={category} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden flex-col gap-8 lg:flex">{sidebarContent}</aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MobileFilterDrawer>{sidebarContent}</MobileFilterDrawer>
              <p className="text-muted-foreground text-sm">{total} products</p>
            </div>
            <SortLinks basePath={basePath} currentSort={sort} extraParams={extraParams} />
          </div>
          <ActiveFilters chips={chips} clearAllHref={basePath} />
          <ProductGrid products={products} />
          <Pagination
            basePath={basePath}
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
