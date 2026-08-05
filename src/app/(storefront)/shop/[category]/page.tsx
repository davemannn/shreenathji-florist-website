import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listShopProducts } from "@/features/product/queries";
import { getCategoryBySlug, listAllCategories } from "@/features/category/queries";
import { ProductGrid } from "@/features/product/components/product-grid";
import { SortLinks } from "@/features/product/components/sort-links";
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

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/shop/[category]">) {
  const { category: categorySlug } = await params;
  const sp = await searchParams;
  const sort = typeof sp.sort === "string" ? (sp.sort as ProductSort) : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) || 1 : 1;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const [{ products, total, pageSize }, categories] = await Promise.all([
    listShopProducts({ categorySlug, sort, page }),
    listAllCategories(),
  ]);

  const basePath = `/shop/${categorySlug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <CategoryHeader category={category} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <CategorySidebar categories={categories} activeSlug={categorySlug} />
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">{total} products</p>
            <SortLinks basePath={basePath} currentSort={sort} />
          </div>
          <ProductGrid products={products} />
          <Pagination
            basePath={basePath}
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
