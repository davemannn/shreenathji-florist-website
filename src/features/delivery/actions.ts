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

  revalidatePath("/admin/delivery-slots");
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

  revalidatePath("/admin/delivery-slots");
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

  revalidatePath("/admin/delivery-slots");
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

  revalidatePath("/admin/delivery-slots");
}

export async function reorderDeliverySlotsAction(orderedIds: string[]) {
  await requireAdminCapability("delivery_slots:manage");
  await reorderDeliverySlotsRepo(orderedIds);
  revalidatePath("/admin/delivery-slots");
}
