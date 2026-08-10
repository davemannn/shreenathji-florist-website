import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gift } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/features/product/queries";
import { ProductGallery } from "@/features/product/components/product-gallery";
import { VariantSelectionProvider } from "@/features/product/components/variant-selection-context";
import { AddToCartForm } from "@/features/product/components/add-to-cart-form";
import { DeliveryEstimate } from "@/features/product/components/delivery-estimate";
import { ProductReviewsSection } from "@/features/review/components/product-reviews-section";
import { RelatedProducts } from "@/features/product/components/related-products";
import { StarRating } from "@/components/shared/star-rating";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { WhatsAppChatLink } from "@/components/shared/whatsapp-chat-link";
import { getStoreSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";

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

  const [relatedProducts, { midnightCutoffHour }] = await Promise.all([
    getRelatedProducts(product.id, product.categorySlugs),
    getStoreSettings(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.title },
        ]}
      />

      <VariantSelectionProvider
        defaultVariantId={(product.variants.find((v) => v.isDefault) ?? product.variants[0])?.id}
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery
            images={product.images}
            title={product.title}
            variants={product.variants}
          />
          <div className="flex flex-col gap-6">
            <div>
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
              <h1 className="mt-2 text-3xl md:text-4xl">{product.title}</h1>
            </div>
            {product.comboIncludes ? (
              <div className="border-brand/30 bg-brand/5 flex items-start gap-2.5 rounded-xs border p-3">
                <Gift className="text-brand mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">What&rsquo;s Included</p>
                  <p className="text-muted-foreground text-sm">{product.comboIncludes}</p>
                </div>
              </div>
            ) : null}
            <AddToCartForm product={product} />
            <DeliveryEstimate midnightCutoffHour={midnightCutoffHour} />
            <WhatsAppChatLink
              message={`Hi! I have a question about "${product.title}" (${siteConfig.url}/shop/product/${slug}).`}
              className="text-muted-foreground hover:text-foreground w-fit text-sm"
            >
              Ask about this on WhatsApp
            </WhatsAppChatLink>
            <div>
              <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">Description</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>
      </VariantSelectionProvider>

      <ProductReviewsSection productId={product.id} productSlug={slug} reviews={product.reviews} />
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
