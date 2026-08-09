import {
  findSubscriptionPlanById,
  listActiveSubscriptionPlans as listActiveSubscriptionPlansRepo,
  listSubscriptionPlansAdmin as listSubscriptionPlansAdminRepo,
} from "@/server/repositories/subscription-plan.repository";
import {
  listSubscriptionsForUser,
  listSubscriptionsAdmin as listSubscriptionsAdminRepo,
  findCustomerSubscriptionByIdAdmin,
  type ListSubscriptionsAdminParams,
} from "@/server/repositories/customer-subscription.repository";
import type {
  AdminCustomerSubscription,
  AdminSubscriptionPlan,
  CustomerSubscriptionSummary,
  SubscriptionPlanDisplay,
} from "./types";

export async function getSubscriptionPlans(): Promise<SubscriptionPlanDisplay[]> {
  const rows = await listActiveSubscriptionPlansRepo();
  return rows
    .filter((row) => row.intervals.length > 0)
    .map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      imageUrl: row.imageUrl ?? undefined,
      intervals: row.intervals.map((interval) => ({
        id: interval.id,
        interval: interval.interval,
        price: interval.price,
        discountPercent: interval.discountPercent,
      })),
    }));
}

export async function getMySubscriptions(userId: string): Promise<CustomerSubscriptionSummary[]> {
  const rows = await listSubscriptionsForUser(userId);
  return rows.map((row) => ({
    id: row.id,
    planName: row.plan.name,
    planImageUrl: row.plan.imageUrl ?? undefined,
    interval: row.planInterval.interval,
    price: row.planInterval.price,
    status: row.status,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString(),
    razorpaySubscriptionId: row.razorpaySubscriptionId,
    createdAt: row.createdAt.toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Admin panel.
// ---------------------------------------------------------------------------

function toAdminPlan(
  row: NonNullable<Awaited<ReturnType<typeof findSubscriptionPlanById>>>,
): AdminSubscriptionPlan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    imageUrl: row.imageUrl ?? undefined,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    intervals: row.intervals.map((interval) => ({
      id: interval.id,
      interval: interval.interval,
      price: interval.price,
      discountPercent: interval.discountPercent,
      razorpayPlanId: interval.razorpayPlanId ?? undefined,
    })),
  };
}

export async function listSubscriptionPlansAdmin(): Promise<AdminSubscriptionPlan[]> {
  const rows = await listSubscriptionPlansAdminRepo();
  return rows.map(toAdminPlan);
}

export async function getSubscriptionPlanForEdit(
  id: string,
): Promise<AdminSubscriptionPlan | null> {
  const row = await findSubscriptionPlanById(id);
  return row ? toAdminPlan(row) : null;
}

export interface AdminSubscriptionListResult {
  subscriptions: AdminCustomerSubscription[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listSubscriptionsAdmin(
  params: ListSubscriptionsAdminParams = {},
): Promise<AdminSubscriptionListResult> {
  const { subscriptions, total, page, pageSize } = await listSubscriptionsAdminRepo(params);
  return {
    subscriptions: subscriptions.map((row) => ({
      id: row.id,
      userName: row.user.name,
      userEmail: row.user.email,
      planName: row.plan.name,
      interval: row.planInterval.interval,
      price: row.planInterval.price,
      status: row.status,
      recipientName: row.recipientName,
      recipientPhone: row.recipientPhone,
      currentPeriodEnd: row.currentPeriodEnd?.toISOString(),
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
  };
}

export async function getSubscriptionForAdmin(id: string) {
  const row = await findCustomerSubscriptionByIdAdmin(id);
  if (!row) return null;
  return {
    id: row.id,
    userName: row.user.name,
    userEmail: row.user.email,
    planName: row.plan.name,
    interval: row.planInterval.interval,
    price: row.planInterval.price,
    status: row.status,
    recipientName: row.recipientName,
    recipientPhone: row.recipientPhone,
    deliveryLine1: row.deliveryLine1,
    deliveryLine2: row.deliveryLine2 ?? undefined,
    deliveryCity: row.deliveryCity,
    deliveryState: row.deliveryState,
    deliveryPincode: row.deliveryPincode,
    razorpaySubscriptionId: row.razorpaySubscriptionId,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString(),
    cancelledAt: row.cancelledAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    orders: row.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    })),
  };
}
