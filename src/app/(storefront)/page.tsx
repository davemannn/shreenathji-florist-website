import { HeroSlider } from "@/features/homepage-content/components/hero-slider";
import { PromoBannerStrip } from "@/features/homepage-content/components/promo-banner-strip";
import { OccasionBanner } from "@/features/homepage-content/components/occasion-banner";
import { SubscribeTeaser } from "@/features/homepage-content/components/subscribe-teaser";
import { TopCategories } from "@/features/category/components/top-categories";
import { BestSellersSection } from "@/features/product/components/best-sellers-section";
import { DeliveryFeaturesStrip } from "@/features/delivery/components/delivery-features-strip";
import { TestimonialsSection } from "@/features/testimonial/components/testimonials-section";
import { FaqAccordion } from "@/features/faq/components/faq-accordion";
import { InstagramGrid } from "@/features/gallery/components/instagram-grid";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

// TopCategories/BestSellersSection read the live catalog from the DB. Without
// this, Next has no per-request signal on this route and would happily
// prerender it once at build time — baking in whatever categories/products
// existed then. That's wrong for a catalog managed through an admin panel
// (edits wouldn't show up without a full rebuild+redeploy), and it's also
// why the Hostinger build failed outright: the build container couldn't
// reach the production DB to do that one-time prerender at all.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <PromoBannerStrip />
      <ScrollReveal>
        <TopCategories />
      </ScrollReveal>
      <ScrollReveal>
        <OccasionBanner />
      </ScrollReveal>
      <ScrollReveal>
        <BestSellersSection />
      </ScrollReveal>
      <SubscribeTeaser />
      <DeliveryFeaturesStrip />
      <ScrollReveal>
        <TestimonialsSection />
      </ScrollReveal>
      <ScrollReveal>
        <FaqAccordion />
      </ScrollReveal>
      <ScrollReveal>
        <InstagramGrid />
      </ScrollReveal>
    </>
  );
}
