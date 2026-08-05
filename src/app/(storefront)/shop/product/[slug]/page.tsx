import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/features/product/queries";
import { ProductGallery } from "@/features/product/components/product-gallery";
import { AddToCartForm } from "@/features/product/components/add-to-cart-form";
import { DeliveryEstimate } from "@/features/product/components/delivery-estimate";
import { ProductReviews } from "@/features/product/components/product-reviews";
import { RelatedProducts } from "@/features/product/components/related-products";
import { StarRating } from "@/components/shared/star-rating";

export async function generateMetadata({
  params,
}: PageProps<"/shop/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.title ?? "Product" };
}

export default async function ProductDetailPage({ params }: PageProps<"/shop/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, product.categorySlugs);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="text-muted-foreground mb-6 flex items-center gap-1.5 text-xs"
      >
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />
        <div className="flex flex-col gap-6">
          <div>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            <h1 className="mt-2 text-3xl md:text-4xl">{product.title}</h1>
          </div>
          <AddToCartForm product={product} />
          <DeliveryEstimate />
          <div>
            <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">Description</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      <ProductReviews reviews={product.reviews} />
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
