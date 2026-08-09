export interface HeroSlide {
  id: string;
  eyebrow: string;
  /** May contain "\n" for a manual line break in the headline. */
  headline: string;
  ctaLabel: string;
  ctaHref: string;
  imageAlt: string;
  /** Temporary stock photo — see queries.ts. Omit to fall back to a placeholder block. */
  imageUrl?: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  imageAlt: string;
  imageUrl?: string;
}

export interface OccasionBanner {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  imageAlt: string;
  imageUrl?: string;
}

export interface SubscribeTeaserContent {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}
