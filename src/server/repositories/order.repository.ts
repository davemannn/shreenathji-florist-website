import { prisma } from "@/server/db/prisma";

export interface CreateOrderItemInput {
  productId?: string;
  variantId?: string;
  productTitle: string;
  variantLabel?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CreateOrderInput {
  orderNumber: string;
  userId: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: "COD" | "RAZORPAY";
  recipientName: string;
  recipientPhone: string;
  deliveryLine1: string;
  deliveryLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  deliveryDate: Date;
  deliverySlotId?: string;
  messageCard?: string;
  giftWrap: boolean;
  couponId?: string;
  items: CreateOrderItemInput[];
}

/**
 * Nested Prisma writes (`create` with a nested relation `create`) execute as
 * a single atomic operation — the Order and all its OrderItems either all
 * land or none do, no separate `$transaction` wrapper needed.
 */
export async function createOrder(input: CreateOrderInput) {
  const { items, ...orderData } = input;

  return prisma.order.create({
    data: {
      ...orderData,
      items: { create: items },
    },
    include: { items: true },
  });
}

/** All orders for a user, newest first — powers the account dashboard's order history. */
export async function listOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function findOrderByNumber(orderNumber: string, userId: string) {
  return prisma.order.findFirst({
    where: { orderNumber, userId },
    include: { items: true, deliverySlot: true, coupon: true },
  });
}

/** Scoped by userId too — never trust a client-supplied orderId alone before mutating payment state. */
export async function findOrderById(orderId: string, userId: string) {
  return prisma.order.findFirst({ where: { id: orderId, userId } });
}

export async function attachRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { razorpayOrderId },
  });
}

export async function markOrderPaid(orderId: string, razorpayPaymentId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId },
  });
}

export async function markOrderConfirmedCod(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CONFIRMED" },
  });
}

// ---------------------------------------------------------------------------
// Admin panel — order management (Phase 2).
// ---------------------------------------------------------------------------

export type OrderStatusFilter =
  "PENDING" | "CONFIRMED" | "PROCESSING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export interface ListOrdersAdminParams {
  status?: OrderStatusFilter;
  search?: string;
  page?: number;
  pageSize?: number;
}

const ADMIN_ORDER_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
  assignedDeliveryPerson: { select: { id: true, name: true, phone: true } },
  items: true,
};

export async function listOrdersAdmin(params: ListOrdersAdminParams = {}) {
  const { status, search, page = 1, pageSize = 20 } = params;

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { recipientName: { contains: search } },
            { recipientPhone: { contains: search } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: ADMIN_ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, pageSize };
}

/** No userId scoping — admin/staff can look up any order. */
export async function findOrderByIdAdmin(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      ...ADMIN_ORDER_INCLUDE,
      deliverySlot: true,
      coupon: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
}

/** Orders assigned to a specific delivery_guy — powers /admin/my-deliveries. */
export async function listOrdersForDeliveryPerson(deliveryPersonId: string) {
  return prisma.order.findMany({
    where: {
      assignedDeliveryPersonId: deliveryPersonId,
      status: { notIn: ["DELIVERED", "CANCELLED"] },
    },
    include: { items: true, deliverySlot: true },
    orderBy: { deliveryDate: "asc" },
  });
}

export async function listActiveDeliveryPersons() {
  return prisma.user.findMany({
    where: { role: "delivery_guy", banned: { not: true } },
    select: { id: true, name: true, phone: true },
    orderBy: { name: "asc" },
  });
}

export interface UpdateOrderStatusInput {
  orderId: string;
  toStatus: OrderStatusFilter;
  changedByUserId: string;
  changedByName: string;
  changedByRole: string;
  note?: string;
}

/**
 * Updates the order's status and logs it to OrderStatusHistory in one
 * transaction. Sets deliveredAt when transitioning to DELIVERED — the only
 * place that timestamp is ever set, so it doubles as "was this ever
 * delivered" without a separate boolean.
 */
export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.order.findUniqueOrThrow({
      where: { id: input.orderId },
      select: { status: true },
    });

    const order = await tx.order.update({
      where: { id: input.orderId },
      data: {
        status: input.toStatus,
        ...(input.toStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: input.orderId,
        fromStatus: current.status,
        toStatus: input.toStatus,
        changedByUserId: input.changedByUserId,
        changedByName: input.changedByName,
        changedByRole: input.changedByRole,
        note: input.note,
      },
    });

    return order;
  });
}

export async function assignDeliveryPerson(orderId: string, deliveryPersonId: string | null) {
  return prisma.order.update({
    where: { id: orderId },
    data: { assignedDeliveryPersonId: deliveryPersonId },
  });
}

/** Powers the realtime polling badge — cheap indexed query, no full order data. */
export async function getOrderNotificationSummary() {
  const [pendingCount, latest] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
  ]);

  return { pendingCount, latestOrderCreatedAt: latest?.createdAt ?? null };
}

export async function getDeliveryNotificationSummary(deliveryPersonId: string) {
  const [assignedCount, latest] = await Promise.all([
    prisma.order.count({
      where: {
        assignedDeliveryPersonId: deliveryPersonId,
        status: { notIn: ["DELIVERED", "CANCELLED"] },
      },
    }),
    prisma.order.findFirst({
      where: { assignedDeliveryPersonId: deliveryPersonId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ]);

  return { assignedCount, latestUpdateAt: latest?.updatedAt ?? null };
}
