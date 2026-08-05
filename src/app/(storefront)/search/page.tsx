import type { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import { searchShopProducts } from "@/features/product/queries";
import { ProductGrid } from "@/features/product/components/product-grid";
import { Pagination } from "@/components/shared/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Search",
};

const PAGE_SIZE = 12;

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q, page: pageParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const result = query
    ? await searchShopProducts({ query, page, pageSize: PAGE_SIZE })
    : { products: [], total: 0, page: 1, pageSize: PAGE_SIZE };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl md:text-4xl">Search</h1>

      <form action="/search" method="GET" className="mb-10 flex max-w-lg gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search for flowers, cakes, gifts…"
          aria-label="Search products"
        />
        <Button type="submit" variant="brand">
          <SearchIcon aria-hidden="true" />
          Search
        </Button>
      </form>

      {query ? (
        <>
          <p className="text-muted-foreground mb-6 text-sm">
            {result.total} result{result.total === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
          </p>
          <ProductGrid
            products={result.products}
            emptyMessage="Try a different search term, or browse the shop instead."
          />
          <Pagination
            basePath="/search"
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            extraParams={{ q: query }}
          />
        </>
      ) : (
        <p className="text-muted-foreground py-16 text-center">
          Enter a search term above to find products.
        </p>
      )}
    </div>
  );
}
