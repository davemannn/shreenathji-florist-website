"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createBanner as createBannerRepo,
  deleteBanner as deleteBannerRepo,
  findBannerById,
  reorderBanners,
  setBannerActive,
  updateBanner as updateBannerRepo,
  type BannerInput,
} from "@/server/repositories/banner.repository";
import { bannerFormSchema, type BannerFormValues } from "./validations";

function toRepoInput(values: BannerFormValues): BannerInput {
  return {
    type: values.type,
    eyebrow: values.eyebrow || null,
    headline: values.headline,
    subtitle: values.subtitle || null,
    ctaLabel: values.ctaLabel || null,
    ctaHref: values.ctaHref || null,
    imageUrl: values.imageUrl || null,
    imageAlt: values.imageAlt || null,
    imageCloudinaryId: values.imageCloudinaryId || null,
    isActive: values.isActive,
    startsAt: values.startsAt ? new Date(values.startsAt) : null,
    endsAt: values.endsAt ? new Date(values.endsAt) : null,
  };
}

export async function createBannerAction(input: BannerFormValues) {
  const session = await requireAdminCapability("banners:manage");
  const values = bannerFormSchema.parse(input);

  const banner = await createBannerRepo(toRepoInput(values));

  await logAudit(session, {
    entityType: "Banner",
    entityId: banner.id,
    entityLabel: `${values.type} · ${values.headline}`,
    action: "created",
    summary: `Created a ${values.type.toLowerCase()} banner`,
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { id: banner.id };
}

export async function updateBannerAction(id: string, input: BannerFormValues) {
  const session = await requireAdminCapability("banners:manage");
  const values = bannerFormSchema.parse(input);

  const before = await findBannerById(id);
  await updateBannerRepo(id, toRepoInput(values));

  if (before) {
    await logAudit(session, {
      entityType: "Banner",
      entityId: id,
      entityLabel: `${values.type} · ${values.headline}`,
      action: "updated",
      summary: `Updated "${values.headline}"`,
    });
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function setBannerActiveAction(id: string, isActive: boolean) {
  const session = await requireAdminCapability("banners:manage");
  const before = await findBannerById(id);
  await setBannerActive(id, isActive);

  if (before) {
    await logAudit(session, {
      entityType: "Banner",
      entityId: id,
      entityLabel: `${before.type} · ${before.headline}`,
      action: isActive ? "restored" : "archived",
      summary: isActive ? "Reactivated" : "Deactivated",
    });
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBannerAction(id: string) {
  const session = await requireAdminCapability("banners:manage");
  const before = await findBannerById(id);
  await deleteBannerRepo(id);

  if (before) {
    await logAudit(session, {
      entityType: "Banner",
      entityId: id,
      entityLabel: `${before.type} · ${before.headline}`,
      action: "deleted",
      summary: "Deleted",
    });
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function reorderBannersAction(orderedIds: string[]) {
  await requireAdminCapability("banners:manage");
  await reorderBanners(orderedIds);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
