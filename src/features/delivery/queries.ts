import {
  findDeliverySlotById,
  listDeliverySlotsAdmin as listDeliverySlotsAdminRepo,
} from "@/server/repositories/delivery-slot.repository";
import type { AdminDeliverySlot, DeliveryFeature } from "./types";

// Florist-specific delivery promises, replacing the reference theme's
// generic "30% off + free shipping" trust strip with what actually matters
// for this business per the product brief.
const DELIVERY_FEATURES: DeliveryFeature[] = [
  {
    id: "1",
    icon: "clock",
    title: "Same Day Delivery",
    description: "Order before 4 PM for delivery anywhere in Vadodara, today.",
  },
  {
    id: "2",
    icon: "moon",
    title: "Midnight Delivery",
    description: "Surprise them at 12 AM sharp for birthdays & anniversaries.",
  },
  {
    id: "3",
    icon: "flower",
    title: "Freshness Guaranteed",
    description: "Hand-picked, freshly cut flowers — every single order.",
  },
];

export async function getDeliveryFeatures(): Promise<DeliveryFeature[]> {
  return DELIVERY_FEATURES;
}

// ---------------------------------------------------------------------------
// Admin panel — marketing/content management (Phase 4).
// ---------------------------------------------------------------------------

function toAdminSlot(slot: Awaited<ReturnType<typeof findDeliverySlotById>>): AdminDeliverySlot {
  return {
    id: slot!.id,
    label: slot!.label,
    type: slot!.type,
    extraCharge: slot!.extraCharge,
    isActive: slot!.isActive,
    sortOrder: slot!.sortOrder,
  };
}

export async function listDeliverySlotsAdmin(): Promise<AdminDeliverySlot[]> {
  const slots = await listDeliverySlotsAdminRepo();
  return slots.map(toAdminSlot);
}

export async function getDeliverySlotForEdit(id: string): Promise<AdminDeliverySlot | null> {
  const slot = await findDeliverySlotById(id);
  return slot ? toAdminSlot(slot) : null;
}
