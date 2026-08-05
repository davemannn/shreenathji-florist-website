import { HeroSlider } from "@/features/homepage-content/components/hero-slider";
import { PromoBannerStrip } from "@/features/homepage-content/components/promo-banner-strip";
import { OccasionBanner } from "@/features/homepage-content/components/occasion-banner";
import { NewsletterTeaser } from "@/features/homepage-content/components/newsletter-teaser";
import { TopCategories } from "@/features/category/components/top-categories";
import { BestSellersSection } from "@/features/product/components/best-sellers-section";
import { DeliveryFeaturesStrip } from "@/features/delivery/components/delivery-features-strip";
import { TestimonialsSection } from "@/features/review/components/testimonials-section";
import { GoogleReviewsSection } from "@/features/review/components/google-reviews-section";
import { FaqAccordion } from "@/features/faq/components/faq-accordion";
import { InstagramGrid } from "@/features/gallery/components/instagram-grid";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

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
      <NewsletterTeaser />
      <DeliveryFeaturesStrip />
      <ScrollReveal>
        <TestimonialsSection />
      </ScrollReveal>
      <GoogleReviewsSection />
      <ScrollReveal>
        <FaqAccordion />
      </ScrollReveal>
      <ScrollReveal>
        <InstagramGrid />
      </ScrollReveal>
    </>
  );
}
