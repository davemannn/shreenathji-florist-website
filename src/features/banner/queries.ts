import {
  findBannerById,
  listBannersAdmin as listBannersAdminRepo,
} from "@/server/repositories/banner.repository";
import type { AdminBanner, BannerType } from "./types";

type BannerRow = Awaited<ReturnType<typeof listBannersAdminRepo>>[number];

function toAdminBanner(row: BannerRow): AdminBanner {
  return {
    id: row.id,
    type: row.type as BannerType,
    eyebrow: row.eyebrow ?? undefined,
    headline: row.headline,
    subtitle: row.subtitle ?? undefined,
    ctaLabel: row.ctaLabel ?? undefined,
    ctaHref: row.ctaHref ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    imageAlt: row.imageAlt ?? undefined,
    imageCloudinaryId: row.imageCloudinaryId ?? undefined,
    isActive: row.isActive,
    startsAt: row.startsAt?.toISOString(),
    endsAt: row.endsAt?.toISOString(),
    sortOrder: row.sortOrder,
  };
}

export async function listBannersAdmin(type?: BannerType): Promise<AdminBanner[]> {
  const rows = await listBannersAdminRepo({ type });
  return rows.map(toAdminBanner);
}

export async function getBannerForEdit(id: string): Promise<AdminBanner | null> {
  const row = await findBannerById(id);
  return row ? toAdminBanner(row) : null;
}
