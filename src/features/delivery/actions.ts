"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createDeliverySlot as createDeliverySlotRepo,
  deleteDeliverySlot as deleteDeliverySlotRepo,
  findDeliverySlotById,
  reorderDeliverySlots as reorderDeliverySlotsRepo,
  setDeliverySlotActive,
  updateDeliverySlot as updateDeliverySlotRepo,
} from "@/server/repositories/delivery-slot.repository";
import { deliverySlotFormSchema, type DeliverySlotFormValues } from "./validations";

/**
 * A slot's charge/active-state is the real, single source of truth for the
 * Same Day / Midnight marketing pages and checkout pricing now (see
 * delivery-slot.repository.ts's findActiveDeliverySlotByType) — so every
 * mutation here needs to revalidate those alongside the admin page itself.
 */
function revalidateDeliveryPricingPaths() {
  revalidatePath("/admin/delivery-slots");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/same-day-delivery");
  revalidatePath("/midnight-delivery");
}

export async function createDeliverySlotAction(input: DeliverySlotFormValues) {
  const session = await requireAdminCapability("delivery_slots:manage");
  const values = deliverySlotFormSchema.parse(input);
  const slot = await createDeliverySlotRepo(values);

  await logAudit(session, {
    entityType: "DeliverySlot",
    entityId: slot.id,
    entityLabel: values.label,
    action: "created",
    summary: `Created (₹${values.extraCharge})`,
  });

  revalidateDeliveryPricingPaths();
  return { id: slot.id };
}

export async function updateDeliverySlotAction(id: string, input: DeliverySlotFormValues) {
  const session = await requireAdminCapability("delivery_slots:manage");
  const values = deliverySlotFormSchema.parse(input);

  const before = await findDeliverySlotById(id);
  await updateDeliverySlotRepo(id, values);

  if (before) {
    const changes: string[] = [];
    if (before.extraCharge !== values.extraCharge) {
      changes.push(`Charge ₹${before.extraCharge} → ₹${values.extraCharge}`);
    }
    if (before.isActive !== values.isActive)
      changes.push(values.isActive ? "Reactivated" : "Deactivated");
    await logAudit(session, {
      entityType: "DeliverySlot",
      entityId: id,
      entityLabel: values.label,
      action: "updated",
      summary: changes.length > 0 ? changes.join("; ") : "Updated delivery slot details",
    });
  }

  revalidateDeliveryPricingPaths();
  revalidatePath(`/admin/delivery-slots/${id}`);
}

export async function setDeliverySlotActiveAction(id: string, isActive: boolean) {
  const session = await requireAdminCapability("delivery_slots:manage");
  const slot = await setDeliverySlotActive(id, isActive);

  await logAudit(session, {
    entityType: "DeliverySlot",
    entityId: id,
    entityLabel: slot.label,
    action: isActive ? "restored" : "archived",
    summary: isActive ? "Reactivated" : "Deactivated",
  });

  revalidateDeliveryPricingPaths();
}

export async function deleteDeliverySlotAction(id: string) {
  const session = await requireAdminCapability("delivery_slots:manage");
  const slot = await findDeliverySlotById(id);
  await deleteDeliverySlotRepo(id);

  if (slot) {
    await logAudit(session, {
      entityType: "DeliverySlot",
      entityId: id,
      entityLabel: slot.label,
      action: "deleted",
      summary: "Permanently deleted",
    });
  }

  revalidateDeliveryPricingPaths();
}

export async function reorderDeliverySlotsAction(orderedIds: string[]) {
  await requireAdminCapability("delivery_slots:manage");
  await reorderDeliverySlotsRepo(orderedIds);
  // Sort order also breaks ties in findActiveDeliverySlotByType if a store
  // ever has more than one active slot of the same type.
  revalidateDeliveryPricingPaths();
}
