import type { DeliverySlotType } from "@/lib/delivery";

export interface SavedAddress {
  id: string;
  label?: string;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface DeliverySlotOption {
  id: string;
  label: string;
  extraCharge: number;
  type: DeliverySlotType;
}
