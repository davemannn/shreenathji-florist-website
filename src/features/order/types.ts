export type OrderStatus =
  "PENDING" | "CONFIRMED" | "PROCESSING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "COD" | "RAZORPAY";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  total: number;
  itemCount: number;
  recipientName: string;
  recipientPhone: string;
  customerName: string;
  customerEmail: string;
  assignedDeliveryPersonName?: string;
  deliveryDate: string;
  createdAt: string;
}

export interface OrderLineItem {
  id: string;
  productTitle: string;
  variantLabel?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  changedByName: string;
  changedByRole: string;
  note?: string;
  createdAt: string;
}

export interface OrderDetail extends OrderListItem {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  couponCode?: string;
  recipientPhoneFull: string;
  deliveryLine1: string;
  deliveryLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  deliverySlotLabel?: string;
  messageCard?: string;
  giftWrap: boolean;
  assignedDeliveryPersonId?: string;
  assignedDeliveryPersonPhone?: string;
  deliveredAt?: string;
  items: OrderLineItem[];
  statusHistory: OrderStatusHistoryEntry[];
}

export interface DeliveryPersonOption {
  id: string;
  name: string;
  phone?: string;
}

/** Purpose-built for /admin/my-deliveries — needs full address/phone that the desk-bound OrderListItem doesn't carry. */
export interface DeliveryOrderCard {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  recipientName: string;
  recipientPhone: string;
  deliveryLine1: string;
  deliveryLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  deliveryDate: string;
  deliverySlotLabel?: string;
  messageCard?: string;
  giftWrap: boolean;
  itemCount: number;
}

// ---------------------------------------------------------------------------
// GST invoice — /invoice/[orderNumber] (customer or staff with orders:view:all).
// ---------------------------------------------------------------------------

export interface InvoiceLineItem {
  productTitle: string;
  variantLabel?: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  gstRate: number;
  taxableValue: number;
  taxAmount: number;
}

export interface InvoiceData {
  orderNumber: string;
  invoiceNumber?: string;
  invoicedAt?: string;
  createdAt: string;
  paymentMethod: "COD" | "RAZORPAY";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";

  sellerName: string;
  sellerGstin?: string;
  sellerAddressLine?: string;
  sellerCity?: string;
  sellerState?: string;
  sellerPincode?: string;

  buyerUserId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddressLine1: string;
  buyerAddressLine2?: string;
  buyerCity: string;
  buyerState: string;
  buyerPincode: string;

  items: InvoiceLineItem[];

  subtotal: number;
  discount: number;
  deliveryCharge: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  total: number;
  isInterState: boolean;
}
