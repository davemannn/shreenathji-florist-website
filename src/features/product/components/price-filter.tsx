import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PriceBucket {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

const PRICE_BUCKETS: PriceBucket[] = [
  { label: "Below ₹500", maxPrice: 499 },
  { label: "₹500 – ₹999", minPrice: 500, maxPrice: 999 },
  { label: "₹1,000 – ₹1,999", minPrice: 1000, maxPrice: 1999 },
  { label: "₹2,000 & Above", minPrice: 2000 },
];

interface PriceFilterProps {
  basePath: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  /** Other active query params to preserve when switching buckets (e.g. sort). */
  extraParams?: Record<string, string | undefined>;
}

function hrefFor(
  basePath: string,
  extraParams: Record<string, string | undefined>,
  bucket?: PriceBucket,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraParams)) {
    if (value) params.set(key, value);
  }
  if (bucket?.minPrice !== undefined) params.set("minPrice", String(bucket.minPrice));
  if (bucket?.maxPrice !== undefined) params.set("maxPrice", String(bucket.maxPrice));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Server-renderable (plain Links, like SortLinks) — bucket selection is just a URL change, no client state needed. */
export function PriceFilter({
  basePath,
  currentMinPrice,
  currentMaxPrice,
  extraParams = {},
}: PriceFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">Price</h2>
      {PRICE_BUCKETS.map((bucket) => {
        const isActive = currentMinPrice === bucket.minPrice && currentMaxPrice === bucket.maxPrice;
        return (
          <Link
            key={bucket.label}
            href={hrefFor(basePath, extraParams, isActive ? undefined : bucket)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "rounded-xs px-3 py-2 text-sm",
              isActive ? "bg-brand/10 text-brand font-medium" : "hover:bg-muted",
            )}
          >
            {bucket.label}
          </Link>
        );
      })}
    </div>
  );
}
