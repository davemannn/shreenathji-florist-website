import { ProductCard } from "./product-card";
import type { Product } from "../types";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "Try a different category.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="border-border flex flex-col items-center gap-2 rounded-xs border border-dashed py-24 text-center">
        <p className="font-medium">No products found</p>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
