import { pexelsPhoto } from "@/lib/stock-photo";
import { listActiveBannersByType } from "@/server/repositories/banner.repository";
import type { HeroSlide, SubscribeTeaserContent, OccasionBanner, PromoBanner } from "./types";

// DB-backed via the Banner model (admin-managed at /admin/banners, with
// optional startsAt/endsAt scheduling — see banner.repository.ts). The
// fixtures below only fire as a fallback when a type has zero live rows
// (e.g. right after this migration, or if an admin deactivates every
// banner of one type) — so the homepage never renders a blank hero/promo
// section, and behaves exactly as before until real content is added.

const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    eyebrow: "Fresh Today",
    headline: "Fresh Flowers\n& Feeling Love",
    ctaLabel: "Shop Now",
    ctaHref: "/shop",
    imageAlt: "Hand-tied bouquet of fresh flowers",
    imageUrl: pexelsPhoto("28115373", 1200),
  },
  {
    id: "fallback-2",
    eyebrow: "Birthday Gifts",
    headline: "Inspired\nBy Nature",
    ctaLabel: "Shop Birthday Flowers",
    ctaHref: "/occasions/birthday",
    imageAlt: "Birthday flower arrangement",
    imageUrl: pexelsPhoto("27176823", 1200),
  },
  {
    id: "fallback-3",
    eyebrow: "Same Day Delivery",
    headline: "Fresh Flowers\nFor You, Today",
    ctaLabel: "Order Now",
    ctaHref: "/same-day-delivery",
    imageAlt: "Fresh flowers ready for same-day delivery",
    imageUrl: pexelsPhoto("13306125", 1200),
  },
];

const FALLBACK_PROMO_BANNERS: PromoBanner[] = [
  {
    id: "fallback-1",
    title: "Spring Collections",
    subtitle: "30% Off Today",
    ctaLabel: "Shop Now",
    href: "/shop/flowers",
    imageAlt: "Spring flower collection",
    imageUrl: pexelsPhoto("30891127", 800),
  },
  {
    id: "fallback-2",
    title: "Simple & Elegant",
    subtitle: "New Arrivals",
    ctaLabel: "Shop Now",
    href: "/shop",
    imageAlt: "New arrival bouquets",
    imageUrl: pexelsPhoto("15198293", 800),
  },
  {
    id: "fallback-3",
    title: "Summer Loving",
    subtitle: "Staff Pick",
    ctaLabel: "Shop Now",
    href: "/shop/flowers",
    imageAlt: "Staff-picked summer bouquet",
    imageUrl: pexelsPhoto("5409690", 800),
  },
];

const FALLBACK_OCCASION_BANNER: OccasionBanner = {
  eyebrow: "Better Than Cake",
  heading: "Birthday Bouquets",
  body: "Make their day unforgettable with a hand-tied bouquet, delivered fresh to their door — same day, anywhere in Vadodara.",
  ctaLabel: "Explore",
  ctaHref: "/occasions/birthday",
  imageAlt: "Birthday bouquet arrangement",
  imageUrl: pexelsPhoto("7911051", 900),
};

const SUBSCRIBE_TEASER: SubscribeTeaserContent = {
  eyebrow: "Subscribe & Save",
  heading: "Never Run Out of Fresh Flowers",
  body: "Daily pooja flowers, weekly bouquet boxes, or bulk raw flowers — pick weekly, monthly, or annual billing, save more on longer plans, and cancel anytime.",
  ctaLabel: "Explore Subscriptions",
  ctaHref: "/subscriptions",
};

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const rows = await listActiveBannersByType("HERO");
  if (rows.length === 0) return FALLBACK_HERO_SLIDES;

  return rows.map((row) => ({
    id: row.id,
    eyebrow: row.eyebrow ?? "",
    headline: row.headline,
    ctaLabel: row.ctaLabel ?? "Shop Now",
    ctaHref: row.ctaHref ?? "/shop",
    imageAlt: row.imageAlt ?? row.headline,
    imageUrl: row.imageUrl ?? undefined,
  }));
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  const rows = await listActiveBannersByType("PROMO");
  if (rows.length === 0) return FALLBACK_PROMO_BANNERS;

  return rows.map((row) => ({
    id: row.id,
    title: row.headline,
    subtitle: row.subtitle ?? "",
    ctaLabel: row.ctaLabel ?? "Shop Now",
    href: row.ctaHref ?? "/shop",
    imageAlt: row.imageAlt ?? row.headline,
    imageUrl: row.imageUrl ?? undefined,
  }));
}

export async function getOccasionBanner(): Promise<OccasionBanner> {
  const [row] = await listActiveBannersByType("OCCASION");
  if (!row) return FALLBACK_OCCASION_BANNER;

  return {
    eyebrow: row.eyebrow ?? "",
    heading: row.headline,
    body: row.subtitle ?? "",
    ctaLabel: row.ctaLabel ?? "Explore",
    ctaHref: row.ctaHref ?? "/shop",
    imageAlt: row.imageAlt ?? row.headline,
    imageUrl: row.imageUrl ?? undefined,
  };
}

export async function getSubscribeTeaser(): Promise<SubscribeTeaserContent> {
  return SUBSCRIBE_TEASER;
}
