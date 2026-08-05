import { SectionHeading } from "@/components/shared/section-heading";
import { getBestSellers } from "../queries";
import { LoadMoreProducts } from "./load-more-products";

export async function BestSellersSection() {
  const products = await getBestSellers();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      <SectionHeading eyebrow="Fan Favorites" title="Shop Best Sellers" />
      <LoadMoreProducts products={products} initialCount={4} step={4} />
    </section>
  );
}
