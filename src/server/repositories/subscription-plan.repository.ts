import { prisma } from "@/server/db/prisma";

export type SubscriptionPlanCategory = "DAILY_POOJA" | "WEEKLY_FLOWERS" | "RAW_FLOWERS" | "CUSTOM";
export type BillingInterval = "WEEKLY" | "MONTHLY" | "ANNUAL";

/** Active plans with their intervals, in display order — what the storefront /subscriptions page shows. */
export async function listActiveSubscriptionPlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    include: { intervals: { orderBy: { interval: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listSubscriptionPlansAdmin() {
  return prisma.subscriptionPlan.findMany({
    include: { intervals: { orderBy: { interval: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function findSubscriptionPlanById(id: string) {
  return prisma.subscriptionPlan.findUnique({
    where: { id },
    include: { intervals: { orderBy: { interval: "asc" } } },
  });
}

export interface UpsertSubscriptionPlanInput {
  name: string;
  description: string;
  category: SubscriptionPlanCategory;
  imageUrl?: string;
  isActive: boolean;
}

export async function createSubscriptionPlan(input: UpsertSubscriptionPlanInput) {
  const last = await prisma.subscriptionPlan.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.subscriptionPlan.create({
    data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
}

export async function updateSubscriptionPlan(id: string, input: UpsertSubscriptionPlanInput) {
  return prisma.subscriptionPlan.update({ where: { id }, data: input });
}

export async function setSubscriptionPlanActive(id: string, isActive: boolean) {
  return prisma.subscriptionPlan.update({ where: { id }, data: { isActive } });
}

/** Only actually deletes if nothing subscribes to any of its intervals — the FK from CustomerSubscription is a hard reference (onDelete: Restrict by default), so this would fail at the DB level anyway; checking first gives a clean error instead. */
export async function deleteSubscriptionPlan(id: string) {
  return prisma.subscriptionPlan.delete({ where: { id } });
}

export async function reorderSubscriptionPlans(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.subscriptionPlan.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
}

// ---------------------------------------------------------------------------
// Intervals — the billable cadences a plan offers. Razorpay Plans are
// immutable once created, so a price change here always means minting a
// fresh razorpayPlanId (see features/subscription/actions.ts), never
// editing the old one in place.
// ---------------------------------------------------------------------------

export interface UpsertSubscriptionPlanIntervalInput {
  price: number;
  discountPercent: number;
  razorpayPlanId?: string;
}

export async function upsertSubscriptionPlanInterval(
  subscriptionPlanId: string,
  interval: BillingInterval,
  data: UpsertSubscriptionPlanIntervalInput,
) {
  return prisma.subscriptionPlanInterval.upsert({
    where: { subscriptionPlanId_interval: { subscriptionPlanId, interval } },
    create: { subscriptionPlanId, interval, ...data },
    update: data,
  });
}

/** False (and leaves the row alone) if any non-terminal subscription still references it — never silently orphans an active subscriber's pricing row. */
export async function deleteSubscriptionPlanIntervalIfUnused(id: string): Promise<boolean> {
  const activeCount = await prisma.customerSubscription.count({
    where: {
      subscriptionPlanIntervalId: id,
      status: { notIn: ["CANCELLED", "COMPLETED", "EXPIRED"] },
    },
  });
  if (activeCount > 0) return false;
  await prisma.subscriptionPlanInterval.delete({ where: { id } });
  return true;
}

export async function findSubscriptionPlanInterval(id: string) {
  return prisma.subscriptionPlanInterval.findUnique({
    where: { id },
    include: { subscriptionPlan: true },
  });
}
