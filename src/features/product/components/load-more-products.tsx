"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import type { Product } from "../types";

interface LoadMoreProductsProps {
  products: Product[];
  initialCount?: number;
  step?: number;
}

/**
 * Client boundary: slices a server-fetched array by a client-managed
 * visible-count. Revealing more cards this way (vs. real pagination) means
 * ProductCard necessarily renders client-side here — an unavoidable
 * trade-off of the "Load More" interaction pattern, not a missed
 * Server-Component opportunity.
 */
export function LoadMoreProducts({ products, initialCount = 4, step = 4 }: LoadMoreProductsProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore ? (
        <Button
          variant="outline"
          size="lg"
          onClick={() => setVisibleCount((count) => count + step)}
        >
          Load More
        </Button>
      ) : null}
    </div>
  );
}
