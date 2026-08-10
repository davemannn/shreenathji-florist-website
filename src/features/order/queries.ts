import {
  findOrderByIdAdmin,
  findOrderByNumberAndPhone,
  findOrderByNumberForInvoice,
  listOrdersAdmin as listOrdersAdminRepo,
  listOrdersForDeliveryPerson,
  listActiveDeliveryPersons,
  type ListOrdersAdminParams,
} from "@/server/repositories/order.repository";
import { getStoreSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";
import type {
  DeliveryOrderCard,
  DeliveryPersonOption,
  InvoiceData,
  OrderDetail,
  OrderListItem,
  RazorpayTxnDetails,
  TrackedOrder,
} from "./types";

type OrderRow = Awaited<ReturnType<typeof listOrdersAdminRepo>>["orders"][number];
type OrderDetailRow = NonNullable<Awaited<ReturnType<typeof findOrderByIdAdmin>>>;

/** undefined (not an all-null object) when no method was ever captured — COD/WALLET orders, or a failed payments.fetch(). */
function toRazorpayTxnDetails(order: {
  razorpayMethod: string | null;
  razorpayContact: string | null;
  razorpayEmail: string | null;
  razorpayVpa: string | null;
  razorpayBank: string | null;
  razorpayWallet: string | null;
  razorpayCardLast4: string | null;
  razorpayCardNetwork: string | null;
}): RazorpayTxnDetails | undefined {
  if (!order.razorpayMethod) return undefined;
  return {
    method: order.razorpayMethod,
    contact: order.razorpayContact ?? undefined,
    email: order.razorpayEmail ?? undefined,
    vpa: order.razorpayVpa ?? undefined,
    bank: order.razorpayBank ?? undefined,
    wallet: order.razorpayWallet ?? undefined,
    cardLast4: order.razorpayCardLast4 ?? undefined,
    cardNetwork: order.razorpayCardNetwork ?? undefined,
  };
}

function toListItem(order: OrderRow): OrderListItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
    walletAmountUsed: order.walletAmountUsed,
    refundedAmount: order.refundedAmount,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    customerName: order.user.name,
    customerEmail: order.user.email,
    assignedDeliveryPersonName: order.assignedDeliveryPerson?.name,
    deliveryDate: order.deliveryDate.toISOString(),
    createdAt: order.createdAt.toISOString(),
  };
}

function toDetail(order: OrderDetailRow): OrderDetail {
  return {
    ...toListItem(order),
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryCharge: order.deliveryCharge,
    couponCode: order.coupon?.code,
    recipientPhoneFull: order.recipientPhone,
    deliveryLine1: order.deliveryLine1,
    deliveryLine2: order.deliveryLine2 ?? undefined,
    deliveryCity: order.deliveryCity,
    deliveryState: order.deliveryState,
    deliveryPincode: order.deliveryPincode,
    deliverySlotLabel: order.deliverySlot?.label,
    messageCard: order.messageCard ?? undefined,
    giftWrap: order.giftWrap,
    assignedDeliveryPersonId: order.assignedDeliveryPersonId ?? undefined,
    assignedDeliveryPersonPhone: order.assignedDeliveryPerson?.phone ?? undefined,
    deliveredAt: order.deliveredAt?.toISOString(),
    razorpayPaymentId: order.razorpayPaymentId ?? undefined,
    razorpayTxn: toRazorpayTxnDetails(order),
    refunds: order.refunds.map((refund) => ({
      id: refund.id,
      amount: refund.amount,
      razorpayRefundId: refund.razorpayRefundId,
      razorpayStatus: refund.razorpayStatus,
      reason: refund.reason ?? undefined,
      processedByName: refund.processedBy.name,
      createdAt: refund.createdAt.toISOString(),
    })),
    items: order.items.map((item) => ({
      id: item.id,
      productTitle: item.productTitle,
      variantLabel: item.variantLabel ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    statusHistory: order.statusHistory.map((entry) => ({
      id: entry.id,
      fromStatus: entry.fromStatus ?? undefined,
      toStatus: entry.toStatus,
      changedByName: entry.changedByName,
      changedByRole: entry.changedByRole,
      note: entry.note ?? undefined,
      createdAt: entry.createdAt.toISOString(),
    })),
  };
}

export interface OrderListResult {
  orders: OrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listOrdersAdmin(
  params: ListOrdersAdminParams = {},
): Promise<OrderListResult> {
  const { orders, total, page, pageSize } = await listOrdersAdminRepo(params);
  return { orders: orders.map(toListItem), total, page, pageSize };
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const order = await findOrderByIdAdmin(orderId);
  return order ? toDetail(order) : null;
}

export async function getMyDeliveries(deliveryPersonId: string): Promise<DeliveryOrderCard[]> {
  const orders = await listOrdersForDeliveryPerson(deliveryPersonId);
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    deliveryLine1: order.deliveryLine1,
    deliveryLine2: order.deliveryLine2 ?? undefined,
    deliveryCity: order.deliveryCity,
    deliveryState: order.deliveryState,
    deliveryPincode: order.deliveryPincode,
    deliveryDate: order.deliveryDate.toISOString(),
    deliverySlotLabel: order.deliverySlot?.label,
    messageCard: order.messageCard ?? undefined,
    giftWrap: order.giftWrap,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
}

export async function getActiveDeliveryPersons(): Promise<DeliveryPersonOption[]> {
  const rows = await listActiveDeliveryPersons();
  return rows.map((row) => ({ id: row.id, name: row.name, phone: row.phone ?? undefined }));
}

// ---------------------------------------------------------------------------
// Guest order tracking — /track-order, no session.
// ---------------------------------------------------------------------------

export async function getOrderForTracking(
  orderNumber: string,
  recipientPhone: string,
): Promise<TrackedOrder | null> {
  const order = await findOrderByNumberAndPhone(orderNumber, recipientPhone);
  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    deliveryDate: order.deliveryDate.toISOString(),
    deliverySlotLabel: order.deliverySlot?.label,
    deliveryCity: order.deliveryCity,
    recipientName: order.recipientName,
    items: order.items.map((item) => ({
      productTitle: item.productTitle,
      variantLabel: item.variantLabel ?? undefined,
      quantity: item.quantity,
    })),
    statusHistory: order.statusHistory.map((entry) => ({
      id: entry.id,
      fromStatus: entry.fromStatus ?? undefined,
      toStatus: entry.toStatus,
      changedByName: entry.changedByName,
      changedByRole: entry.changedByRole,
      note: entry.note ?? undefined,
      createdAt: entry.createdAt.toISOString(),
    })),
  };
}

// ---------------------------------------------------------------------------
// GST invoice — /invoice/[orderNumber].
// ---------------------------------------------------------------------------

export async function getInvoiceData(orderNumber: string): Promise<InvoiceData | null> {
  const order = await findOrderByNumberForInvoice(orderNumber);
  if (!order) return null;

  const settings = await getStoreSettings();

  return {
    orderNumber: order.orderNumber,
    invoiceNumber: order.invoiceNumber ?? undefined,
    invoicedAt: order.invoicedAt?.toISOString(),
    createdAt: order.createdAt.toISOString(),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    walletAmountUsed: order.walletAmountUsed,
    refundedAmount: order.refundedAmount,
    razorpayTxn: toRazorpayTxnDetails(order),

    // Business name/address are display-only — safe to show current
    // Settings even for an old order. GSTIN/state are the actual
    // tax-determining facts, so those come from the order's own snapshot
    // (see order.service.ts) instead, frozen at the time it was invoiced.
    sellerName: settings.legalBusinessName || siteConfig.name,
    sellerGstin: order.sellerGstin ?? undefined,
    sellerAddressLine: settings.registeredAddressLine,
    sellerCity: settings.registeredCity,
    sellerState: order.sellerState ?? settings.registeredState,
    sellerPincode: settings.registeredPincode,

    buyerUserId: order.userId,
    buyerName: order.recipientName,
    buyerPhone: order.recipientPhone,
    buyerAddressLine1: order.deliveryLine1,
    buyerAddressLine2: order.deliveryLine2 ?? undefined,
    buyerCity: order.deliveryCity,
    buyerState: order.deliveryState,
    buyerPincode: order.deliveryPincode,

    items: order.items.map((item) => ({
      productTitle: item.productTitle,
      variantLabel: item.variantLabel ?? undefined,
      hsnCode: item.hsnCode ?? undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      gstRate: item.gstRate,
      taxableValue: item.taxableValue,
      taxAmount: item.taxAmount,
    })),

    subtotal: order.subtotal,
    discount: order.discount,
    deliveryCharge: order.deliveryCharge,
    taxableValue: order.taxableValue,
    cgstAmount: order.cgstAmount,
    sgstAmount: order.sgstAmount,
    igstAmount: order.igstAmount,
    totalTax: order.totalTax,
    total: order.total,
    isInterState: order.isInterState,
  };
}
