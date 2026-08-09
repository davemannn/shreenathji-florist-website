"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import type { Product } from "@/features/product/types";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const SUGGESTION_LIMIT = 5;

/**
 * Expand-in-place search overlay, replacing what used to be a plain link to
 * /search. Debounced live suggestions (reuses searchShopProducts via the
 * existing /api/v1/catalog/products?q= route, just capped to a handful of
 * results) — Enter, "See all", or clicking a suggestion still lands on the
 * real /search page to continue browsing/filtering, so nothing about that
 * page changes; this is purely a faster path on top of it.
 */
export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // No setState at the top level here — a too-short query just returns
  // without touching results/loading; the `showResults` render gate below
  // already hides stale state instead, so there's nothing to reset.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    const handle = setTimeout(() => {
      setLoading(true);
      fetch(
        `/api/v1/catalog/products?q=${encodeURIComponent(trimmed)}&pageSize=${SUGGESTION_LIMIT}`,
      )
        .then((res) => res.json())
        .then((json) => {
          setResults(json.data?.products ?? []);
          setTotal(json.data?.total ?? 0);
        })
        .catch(() => {
          setResults([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    close();
  }

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length >= MIN_QUERY_LENGTH;

  return (
    <>
      <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setOpen(true)}>
        <Search aria-hidden="true" />
      </Button>

      {open ? (
        <div
          className="animate-in fade-in fixed inset-0 z-50 bg-black/20 duration-150 supports-backdrop-filter:backdrop-blur-xs"
          onClick={close}
        >
          <div
            className="animate-in fade-in slide-in-from-top-4 mx-auto mt-24 max-w-2xl px-4 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for flowers, cakes, gifts…"
                  aria-label="Search products"
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-full border py-4 pr-4 pl-12 text-base shadow-lg outline-none focus-visible:ring-3 md:text-lg"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close search"
                onClick={close}
              >
                <X aria-hidden="true" />
              </Button>
            </form>

            {showResults ? (
              <div className="bg-background mt-2 overflow-hidden rounded-xs border shadow-lg">
                {loading ? (
                  <p className="text-muted-foreground p-4 text-sm">Searching…</p>
                ) : results.length > 0 ? (
                  <>
                    <ul className="divide-y">
                      {results.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/shop/product/${product.slug}`}
                            onClick={close}
                            className="hover:bg-muted flex items-center gap-3 p-3"
                          >
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt=""
                                width={48}
                                height={48}
                                className="size-12 shrink-0 rounded-md object-cover"
                              />
                            ) : (
                              <div className="bg-muted size-12 shrink-0 rounded-md" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{product.title}</p>
                              <p className="text-muted-foreground text-xs">
                                {formatINR(product.price)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
                      onClick={close}
                      className="text-brand hover:bg-muted block p-3 text-center text-sm font-medium"
                    >
                      See all {total} result{total === 1 ? "" : "s"} for &ldquo;{trimmedQuery}
                      &rdquo;
                    </Link>
                  </>
                ) : (
                  <p className="text-muted-foreground p-4 text-sm">
                    No products found for &ldquo;{trimmedQuery}&rdquo;.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
