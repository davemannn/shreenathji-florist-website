export interface DeliveryFeature {
  id: string;
  icon: "clock" | "moon" | "flower";
  title: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Admin panel — marketing/content management (Phase 4). Unrelated to
// DeliveryFeature above (that's homepage marketing copy) — this is the
// bookable DeliverySlot row customers actually pick at checkout.
// ---------------------------------------------------------------------------

export interface AdminDeliverySlot {
  id: string;
  label: string;
  type: "NORMAL" | "FIXED" | "MIDNIGHT";
  extraCharge: number;
  isActive: boolean;
  sortOrder: number;
}
