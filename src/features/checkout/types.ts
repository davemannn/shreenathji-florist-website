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
}

export interface DeliverySlotOption {
  id: string;
  label: string;
  extraCharge: number;
}
