import { prisma } from "@/server/db/prisma";

export type BannerType = "HERO" | "PROMO" | "OCCASION";

/**
 * "Scheduled" is entirely a query-time filter, not a cron job — a banner
 * with startsAt/endsAt in the future or past simply doesn't match this
 * where clause, so it activates/deactivates itself the moment the clock
 * crosses that boundary on the next page render. No background job, no
 * stale state to worry about.
 */
export async function listActiveBannersByType(type: BannerType, now: Date = new Date()) {
  return prisma.banner.findMany({
    where: {
      type,
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { sortOrder: "asc" },
  });
}

export interface ListBannersAdminParams {
  type?: BannerType;
}

/** Admin management list — every banner regardless of active/scheduled state, so staff can see what's upcoming or expired too. */
export async function listBannersAdmin(params: ListBannersAdminParams = {}) {
  return prisma.banner.findMany({
    where: params.type ? { type: params.type } : {},
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });
}

export async function findBannerById(id: string) {
  return prisma.banner.findUnique({ where: { id } });
}

export interface BannerInput {
  type: BannerType;
  eyebrow?: string | null;
  headline: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageCloudinaryId?: string | null;
  isActive: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

export async function createBanner(input: BannerInput) {
  const maxSort = await prisma.banner.aggregate({
    where: { type: input.type },
    _max: { sortOrder: true },
  });
  return prisma.banner.create({
    data: { ...input, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
  });
}

export async function updateBanner(id: string, input: BannerInput) {
  return prisma.banner.update({ where: { id }, data: input });
}

export async function setBannerActive(id: string, isActive: boolean) {
  return prisma.banner.update({ where: { id }, data: { isActive } });
}

export async function deleteBanner(id: string) {
  return prisma.banner.delete({ where: { id } });
}

/** Persists a full reorder within one banner type — same shape as the other reorder-dialog-backed repositories (categories, delivery slots). */
export async function reorderBanners(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.banner.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
}
