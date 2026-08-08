export type BannerType = "HERO" | "PROMO" | "OCCASION";

export interface AdminBanner {
  id: string;
  type: BannerType;
  eyebrow?: string;
  headline: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCloudinaryId?: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  sortOrder: number;
}
