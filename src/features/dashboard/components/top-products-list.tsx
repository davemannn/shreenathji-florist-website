import { formatINR } from "@/lib/format";
import type { TopProductRow } from "../types";

export function TopProductsList({ products }: { products: TopProductRow[] }) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">No sales in this range.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {products.map((product, index) => (
        <li key={product.productTitle} className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="text-muted-foreground w-4 text-xs">{index + 1}.</span>
            {product.productTitle}
          </span>
          <span className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs">{product.unitsSold} sold</span>
            <span className="font-medium">{formatINR(product.revenue)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
