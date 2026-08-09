import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type SubscriptionStatus =
  | "CREATED"
  | "AUTHENTICATED"
  | "ACTIVE"
  | "PENDING"
  | "HALTED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export interface CreateCustomerSubscriptionInput {
  userId: string;
  subscriptionPlanId: string;
  subscriptionPlanIntervalId: string;
  razorpaySubscriptionId: string;
  recipientName: string;
  recipientPhone: string;
  deliveryLine1: string;
  deliveryLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
}

export async function createCustomerSubscription(input: CreateCustomerSubscriptionInput) {
  return prisma.customerSubscription.create({ data: input });
}

const SUBSCRIPTION_INCLUDE = {
  plan: true,
  planInterval: true,
} satisfies Prisma.CustomerSubscriptionInclude;

/** Scoped to the caller — never trust a client-supplied id alone before mutating/displaying. */
export async function findCustomerSubscriptionById(id: string, userId: string) {
  return prisma.customerSubscription.findFirst({
    where: { id, userId },
    include: SUBSCRIPTION_INCLUDE,
  });
}

/** Unscoped — the webhook handler has no user session to scope against, only the Razorpay-issued id it already trusts (signature-verified by the caller). */
export async function findCustomerSubscriptionByRazorpayId(razorpaySubscriptionId: string) {
  return prisma.customerSubscription.findUnique({
    where: { razorpaySubscriptionId },
    include: { ...SUBSCRIPTION_INCLUDE, user: { select: { id: true, name: true, email: true } } },
  });
}

export async function listSubscriptionsForUser(userId: string) {
  return prisma.customerSubscription.findMany({
    where: { userId },
    include: SUBSCRIPTION_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export interface UpdateSubscriptionStatusExtra {
  currentPeriodEnd?: Date;
  cancelledAt?: Date;
}

export async function updateCustomerSubscriptionStatus(
  razorpaySubscriptionId: string,
  status: SubscriptionStatus,
  extra: UpdateSubscriptionStatusExtra = {},
) {
  return prisma.customerSubscription.update({
    where: { razorpaySubscriptionId },
    data: { status, ...extra },
  });
}

// ---------------------------------------------------------------------------
// Admin panel.
// ---------------------------------------------------------------------------

export interface ListSubscriptionsAdminParams {
  status?: SubscriptionStatus;
  page?: number;
  pageSize?: number;
}

export async function listSubscriptionsAdmin(params: ListSubscriptionsAdminParams = {}) {
  const { status, page = 1, pageSize = 20 } = params;
  const where = status ? { status } : {};

  const [subscriptions, total] = await Promise.all([
    prisma.customerSubscription.findMany({
      where,
      include: {
        ...SUBSCRIPTION_INCLUDE,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customerSubscription.count({ where }),
  ]);

  return { subscriptions, total, page, pageSize };
}

export async function findCustomerSubscriptionByIdAdmin(id: string) {
  return prisma.customerSubscription.findUnique({
    where: { id },
    include: {
      ...SUBSCRIPTION_INCLUDE,
      user: { select: { id: true, name: true, email: true } },
      orders: { orderBy: { createdAt: "desc" } },
    },
  });
}
