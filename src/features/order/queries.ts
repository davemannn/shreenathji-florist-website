import {
  findOrderByIdAdmin,
  listOrdersAdmin as listOrdersAdminRepo,
  listOrdersForDeliveryPerson,
  listActiveDeliveryPersons,
  type ListOrdersAdminParams,
} from "@/server/repositories/order.repository";
import type { DeliveryOrderCard, DeliveryPersonOption, OrderDetail, OrderListItem } from "./types";

type OrderRow = Awaited<ReturnType<typeof listOrdersAdminRepo>>["orders"][number];
type OrderDetailRow = NonNullable<Awaited<ReturnType<typeof findOrderByIdAdmin>>>;

function toListItem(order: OrderRow): OrderListItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
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
