export type OrderStatus =
  "PENDING" | "CONFIRMED" | "PROCESSING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

/** WALLET = the order's full total was covered by wallet balance — no cash due, no gateway payment. */
export type OrderPaymentMethod = "COD" | "RAZORPAY" | "WALLET";

/**
 * /track-order (no-login guest tracking) — deliberately lean: no pricing,
 * no full street address, no payment/customer-account details. Just enough
 * to reassure someone who knows the order number + recipient phone that
 * their delivery is on track.
 */
export interface TrackedOrder {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  deliveryDate: string;
  deliverySlotLabel?: string;
  deliveryCity: string;
  recipientName: string;
  items: { productTitle: string; variantLabel?: string; quantity: number }[];
  statusHistory: OrderStatusHistoryEntry[];
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  total: number;
  /** ₹ of `total` paid from wallet balance — 0 if none used. */
  walletAmountUsed: number;
  /** ₹ refunded via Razorpay so far — 0 if none. Caps at `total - walletAmountUsed`. */
  refundedAmount: number;
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

/** Captured once via Razorpay's payments.fetch() right after payment verification — null/undefined fields for COD/WALLET orders or if the fetch itself failed. */
export interface RazorpayTxnDetails {
  method?: string;
  contact?: string;
  email?: string;
  vpa?: string;
  bank?: string;
  wallet?: string;
  cardLast4?: string;
  cardNetwork?: string;
}

export interface OrderRefundEntry {
  id: string;
  amount: number;
  razorpayRefundId: string;
  razorpayStatus: string;
  reason?: string;
  processedByName: string;
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
  razorpayPaymentId?: string;
  razorpayTxn?: RazorpayTxnDetails;
  refunds: OrderRefundEntry[];
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
  paymentMethod: OrderPaymentMethod;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  /** ₹ of `total` paid from wallet balance — 0 if none used. */
  walletAmountUsed: number;
  /** ₹ refunded via Razorpay so far — 0 if none. */
  refundedAmount: number;
  razorpayTxn?: RazorpayTxnDetails;

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
