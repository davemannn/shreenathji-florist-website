import { SectionHeading } from "@/components/shared/section-heading";
import { ProductGrid } from "./product-grid";
import type { Product } from "../types";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHeading title="You May Also Like" align="left" />
      <ProductGrid products={products} />
    </section>
  );
}
