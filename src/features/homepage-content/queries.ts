import { pexelsPhoto } from "@/lib/stock-photo";
import type { HeroSlide, NewsletterTeaserContent, OccasionBanner, PromoBanner } from "./types";

// Static fixtures for now — homepage content management (admin-editable,
// DB-backed) is a separate future milestone. Components only ever call the
// exported getX() functions below, so swapping the body for a real query
// later doesn't touch any component.

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "1",
    eyebrow: "Fresh Today",
    headline: "Fresh Flowers\n& Feeling Love",
    ctaLabel: "Shop Now",
    ctaHref: "/shop",
    imageAlt: "Hand-tied bouquet of fresh flowers",
    imageUrl: pexelsPhoto("28115373", 1200),
  },
  {
    id: "2",
    eyebrow: "Birthday Gifts",
    headline: "Inspired\nBy Nature",
    ctaLabel: "Shop Birthday Flowers",
    ctaHref: "/occasions/birthday",
    imageAlt: "Birthday flower arrangement",
    imageUrl: pexelsPhoto("27176823", 1200),
  },
  {
    id: "3",
    eyebrow: "Same Day Delivery",
    headline: "Fresh Flowers\nFor You, Today",
    ctaLabel: "Order Now",
    ctaHref: "/same-day-delivery",
    imageAlt: "Fresh flowers ready for same-day delivery",
    imageUrl: pexelsPhoto("13306125", 1200),
  },
];

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: "1",
    title: "Spring Collections",
    subtitle: "30% Off Today",
    ctaLabel: "Shop Now",
    href: "/shop/flowers",
    imageAlt: "Spring flower collection",
    imageUrl: pexelsPhoto("30891127", 800),
  },
  {
    id: "2",
    title: "Simple & Elegant",
    subtitle: "New Arrivals",
    ctaLabel: "Shop Now",
    href: "/shop",
    imageAlt: "New arrival bouquets",
    imageUrl: pexelsPhoto("15198293", 800),
  },
  {
    id: "3",
    title: "Summer Loving",
    subtitle: "Staff Pick",
    ctaLabel: "Shop Now",
    href: "/shop/flowers",
    imageAlt: "Staff-picked summer bouquet",
    imageUrl: pexelsPhoto("5409690", 800),
  },
];

const OCCASION_BANNER: OccasionBanner = {
  eyebrow: "Better Than Cake",
  heading: "Birthday Bouquets",
  body: "Make their day unforgettable with a hand-tied bouquet, delivered fresh to their door — same day, anywhere in Vadodara.",
  ctaLabel: "Explore",
  ctaHref: "/occasions/birthday",
  imageAlt: "Birthday bouquet arrangement",
  imageUrl: pexelsPhoto("7911051", 900),
};

const NEWSLETTER_TEASER: NewsletterTeaserContent = {
  eyebrow: "Subscribe & Save",
  heading: "Flower Subscriptions",
  body: "Get fresh blooms delivered on your schedule — weekly, fortnightly, or monthly. Cancel anytime.",
};

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return HERO_SLIDES;
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  return PROMO_BANNERS;
}

export async function getOccasionBanner(): Promise<OccasionBanner> {
  return OCCASION_BANNER;
}

export async function getNewsletterTeaser(): Promise<NewsletterTeaserContent> {
  return NEWSLETTER_TEASER;
}
