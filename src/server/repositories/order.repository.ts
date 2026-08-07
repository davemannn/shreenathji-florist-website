import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { SINGLETON_ID } from "@/server/repositories/store-settings.repository";
import { financialYearFor, formatInvoiceNumber } from "@/lib/tax";

export interface CreateOrderItemInput {
  productId?: string;
  variantId?: string;
  productTitle: string;
  variantLabel?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  gstRate: number;
  hsnCode?: string;
  taxableValue: number;
  taxAmount: number;
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
  sellerGstin?: string;
  sellerState?: string;
  isInterState: boolean;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
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

/**
 * Unscoped by userId — the invoice route authorizes separately (order
 * owner OR staff with orders:view:all), unlike every other customer-facing
 * lookup which scopes by userId as its only access check.
 */
export async function findOrderByNumberForInvoice(orderNumber: string) {
  return prisma.order.findFirst({
    where: { orderNumber },
    include: {
      items: true,
      deliverySlot: true,
      coupon: true,
      user: { select: { id: true, name: true, email: true } },
    },
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

/**
 * Assigns the next sequential invoice number, scoped to the current Indian
 * financial year (Apr–Mar) — GST invoice series conventionally restart each
 * FY. Only ever called from within the same transaction as the order's
 * confirmation update, so a payment/COD-accept that fails partway never
 * burns a number. Idempotent — a second call on an already-invoiced order
 * is a no-op (guards against a retried webhook/action re-confirming).
 *
 * The FY-rollover branch (reading lastInvoiceFY then deciding to reset to 1)
 * has a narrow theoretical race under two orders confirming in the same
 * instant across a financial-year boundary — accepted as negligible for
 * this business's order volume rather than adding SELECT ... FOR UPDATE
 * complexity for a once-a-year edge case.
 */
async function assignInvoiceNumberIfNeeded(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { invoiceNumber: true },
  });
  if (order.invoiceNumber) return;

  const now = new Date();
  const fy = financialYearFor(now);
  const settings = await tx.storeSettings.findUniqueOrThrow({ where: { id: SINGLETON_ID } });
  const isNewFY = settings.lastInvoiceFY !== fy;

  const updatedSettings = await tx.storeSettings.update({
    where: { id: SINGLETON_ID },
    data: isNewFY
      ? { lastInvoiceNumber: 1, lastInvoiceFY: fy }
      : { lastInvoiceNumber: { increment: 1 } },
  });

  await tx.order.update({
    where: { id: orderId },
    data: {
      invoiceNumber: formatInvoiceNumber(
        updatedSettings.invoicePrefix,
        fy,
        updatedSettings.lastInvoiceNumber,
      ),
      invoicedAt: now,
    },
  });
}

export async function markOrderPaid(orderId: string, razorpayPaymentId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId },
    });
    await assignInvoiceNumberIfNeeded(tx, orderId);
    return order;
  });
}

export async function markOrderConfirmedCod(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
    });
    await assignInvoiceNumberIfNeeded(tx, orderId);
    return order;
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

// ---------------------------------------------------------------------------
// Reports + analytics dashboard.
// ---------------------------------------------------------------------------

export interface DateRangeParams {
  from: Date;
  to: Date;
}

/**
 * Cancelled orders are excluded — they never represent real revenue/tax
 * collected, so including them would overstate every report. Fetched with
 * items in one query and aggregated in the application layer (reports/
 * queries.ts) rather than several grouped SQL queries — this catalog's
 * order volume (a single-city florist) doesn't need the complexity.
 */
export async function listOrdersInRange(params: DateRangeParams) {
  return prisma.order.findMany({
    where: { createdAt: { gte: params.from, lte: params.to }, status: { not: "CANCELLED" } },
    include: { items: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
}

/** Per-customer lifetime first-order date + order count, across ALL time (not just a report's date range) — lets the customer report tell new vs. repeat customers apart. */
export async function getCustomerLifetimeStats() {
  const rows = await prisma.order.groupBy({
    by: ["userId"],
    where: { status: { not: "CANCELLED" } },
    _min: { createdAt: true },
    _count: { _all: true },
  });
  return new Map(
    rows.map((row) => [
      row.userId,
      { firstOrderAt: row._min.createdAt!, lifetimeOrderCount: row._count._all },
    ]),
  );
}

/** Order counts by status within the range — powers the dashboard's operational status breakdown. */
export async function getOrderStatusBreakdown(params: DateRangeParams) {
  const rows = await prisma.order.groupBy({
    by: ["status"],
    where: { createdAt: { gte: params.from, lte: params.to } },
    _count: { _all: true },
  });
  return rows.map((row) => ({ status: row.status, count: row._count._all }));
}

/** Orders delivered within the range, with just enough to compute fulfillment time (createdAt -> deliveredAt). */
export async function listDeliveredOrdersInRange(params: DateRangeParams) {
  return prisma.order.findMany({
    where: { deliveredAt: { gte: params.from, lte: params.to } },
    select: { createdAt: true, deliveredAt: true },
  });
}
