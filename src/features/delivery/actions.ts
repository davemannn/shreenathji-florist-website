"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  createDeliverySlot as createDeliverySlotRepo,
  deleteDeliverySlot as deleteDeliverySlotRepo,
  reorderDeliverySlots as reorderDeliverySlotsRepo,
  updateDeliverySlot as updateDeliverySlotRepo,
} from "@/server/repositories/delivery-slot.repository";
import { deliverySlotFormSchema, type DeliverySlotFormValues } from "./validations";

export async function createDeliverySlotAction(input: DeliverySlotFormValues) {
  await requireAdminCapability("delivery_slots:manage");
  const values = deliverySlotFormSchema.parse(input);
  const slot = await createDeliverySlotRepo(values);
  revalidatePath("/admin/delivery-slots");
  return { id: slot.id };
}

export async function updateDeliverySlotAction(id: string, input: DeliverySlotFormValues) {
  await requireAdminCapability("delivery_slots:manage");
  const values = deliverySlotFormSchema.parse(input);
  await updateDeliverySlotRepo(id, values);
  revalidatePath("/admin/delivery-slots");
  revalidatePath(`/admin/delivery-slots/${id}`);
}

export async function deleteDeliverySlotAction(id: string) {
  await requireAdminCapability("delivery_slots:manage");
  await deleteDeliverySlotRepo(id);
  revalidatePath("/admin/delivery-slots");
}

export async function reorderDeliverySlotsAction(orderedIds: string[]) {
  await requireAdminCapability("delivery_slots:manage");
  await reorderDeliverySlotsRepo(orderedIds);
  revalidatePath("/admin/delivery-slots");
}
