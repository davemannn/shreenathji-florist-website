"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createGalleryItem,
  deleteGalleryItem,
  findGalleryItemById,
  reorderGalleryItems,
  setGalleryItemActive,
  updateGalleryItemCaption,
} from "@/server/repositories/gallery-item.repository";
import { createGalleryItemSchema, type CreateGalleryItemValues } from "./validations";

export async function createGalleryItemAction(input: CreateGalleryItemValues) {
  const session = await requireAdminCapability("gallery:manage");
  const values = createGalleryItemSchema.parse(input);

  const item = await createGalleryItem(values);

  await logAudit(session, {
    entityType: "GalleryItem",
    entityId: item.id,
    entityLabel: values.caption || `${values.type === "VIDEO" ? "Video" : "Photo"} upload`,
    action: "created",
    summary: `Added a ${values.type.toLowerCase()} to the gallery`,
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { id: item.id };
}

export async function setGalleryItemActiveAction(id: string, isActive: boolean) {
  const session = await requireAdminCapability("gallery:manage");
  const before = await findGalleryItemById(id);
  await setGalleryItemActive(id, isActive);

  if (before) {
    await logAudit(session, {
      entityType: "GalleryItem",
      entityId: id,
      entityLabel: before.caption || `${before.type === "VIDEO" ? "Video" : "Photo"}`,
      action: isActive ? "restored" : "archived",
      summary: isActive ? "Shown on the gallery page again" : "Hidden from the gallery page",
    });
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function updateGalleryItemCaptionAction(id: string, caption: string) {
  await requireAdminCapability("gallery:manage");
  await updateGalleryItemCaption(id, caption || null);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function deleteGalleryItemAction(id: string) {
  const session = await requireAdminCapability("gallery:manage");
  const before = await findGalleryItemById(id);
  await deleteGalleryItem(id);

  if (before) {
    await logAudit(session, {
      entityType: "GalleryItem",
      entityId: id,
      entityLabel: before.caption || `${before.type === "VIDEO" ? "Video" : "Photo"}`,
      action: "deleted",
      summary: "Removed from the gallery",
    });
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function reorderGalleryItemsAction(orderedIds: string[]) {
  await requireAdminCapability("gallery:manage");
  await reorderGalleryItems(orderedIds);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}
