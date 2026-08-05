export interface HeroSlide {
  id: string;
  eyebrow: string;
  /** May contain "\n" for a manual line break in the headline. */
  headline: string;
  ctaLabel: string;
  ctaHref: string;
  imageAlt: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  imageAlt: string;
}

export interface OccasionBanner {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  imageAlt: string;
}

export interface NewsletterTeaserContent {
  eyebrow: string;
  heading: string;
  body: string;
}
