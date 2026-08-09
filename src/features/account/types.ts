export interface AccountOrderItem {
  id: string;
  productTitle: string;
  variantLabel?: string;
  imageUrl?: string;
  quantity: number;
  lineTotal: number;
}

export interface AccountOrder {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  paymentMethod: "COD" | "RAZORPAY" | "WALLET";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  total: number;
  walletAmountUsed: number;
  createdAt: string;
  deliveryDate: string;
  items: AccountOrderItem[];
}

export interface AccountAddress {
  id: string;
  label?: string;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export const ACTIVE_ORDER_STATUSES: AccountOrder["status"][] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
];
