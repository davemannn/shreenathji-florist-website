import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProductSort } from "@/server/repositories/product.repository";

const SORT_OPTIONS: { value: ProductSort | undefined; label: string }[] = [
  { value: undefined, label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function SortLinks({
  basePath,
  currentSort,
  extraParams = {},
}: {
  basePath: string;
  currentSort?: ProductSort;
  /** Other active query params to preserve when switching sort (e.g. minPrice/maxPrice). */
  extraParams?: Record<string, string | undefined>;
}) {
  function hrefFor(sort: ProductSort | undefined) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">Sort:</span>
      {SORT_OPTIONS.map((option) => {
        const isActive = currentSort === option.value;

        return (
          <Link
            key={option.label}
            href={hrefFor(option.value)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "rounded-full border px-3 py-1",
              isActive ? "bg-foreground text-background border-foreground" : "hover:bg-muted",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
