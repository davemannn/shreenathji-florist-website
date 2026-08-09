import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

/** Case-sensitive exact match — email is stored/compared as entered, same as Better Auth's own lookup. */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

/** Personal admin-sidebar reorder preference (see config/admin-navigation.ts) — an ordered array of AdminNavItem.href strings, or null to use the config's default order. */
export async function updateAdminNavOrder(userId: string, order: string[]) {
  await prisma.user.update({ where: { id: userId }, data: { adminNavOrder: order } });
}

/**
 * Signed delta to `walletBalance` — positive credits, negative debits.
 * Uses Prisma's atomic `increment` (not read-then-write) so concurrent
 * callers (e.g. two tabs placing an order at once) can never race each
 * other into an inconsistent balance. Callers that must not let a balance
 * go negative (spending at checkout) are responsible for checking the
 * current balance first, inside the same transaction — see
 * order.repository.ts's createOrder.
 */
export async function adjustUserWalletBalance(
  userId: string,
  delta: number,
  client: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return client.user.update({
    where: { id: userId },
    data: { walletBalance: { increment: delta } },
  });
}

// ---------------------------------------------------------------------------
// Admin panel — customers (Better Auth's `defaultRole: "user"` is what every
// regular sign-up gets — staff always has one of the 4 admin roles instead).
// ---------------------------------------------------------------------------

export interface ListCustomersAdminParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listCustomersAdmin(params: ListCustomersAdminParams = {}) {
  const { search, page = 1, pageSize = 20 } = params;
  const where = {
    role: "user",
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { tags: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, pageSize };
}

/** Lifetime order stats for a batch of users — one query for the whole page instead of one per row. */
export async function getCustomerOrderStats(userIds: string[]) {
  const rows = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, status: { not: "CANCELLED" } },
    _sum: { total: true },
    _count: { _all: true },
    _max: { createdAt: true },
  });
  return new Map(
    rows.map((row) => [
      row.userId,
      {
        lifetimeSpent: row._sum.total ?? 0,
        lifetimeOrderCount: row._count._all,
        lastOrderAt: row._max.createdAt,
      },
    ]),
  );
}

export async function findCustomerByIdAdmin(id: string) {
  return prisma.user.findFirst({
    where: { id, role: "user" },
    include: {
      tags: { orderBy: { createdAt: "desc" } },
      addresses: { orderBy: { isDefault: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: true },
      },
    },
  });
}

export async function addCustomerTag(userId: string, label: string) {
  return prisma.customerTag.upsert({
    where: { userId_label: { userId, label } },
    update: {},
    create: { userId, label },
  });
}

export async function removeCustomerTag(tagId: string) {
  return prisma.customerTag.delete({ where: { id: tagId } });
}

export async function setUserMarketingOptOut(userId: string, optOut: boolean) {
  return prisma.user.update({ where: { id: userId }, data: { marketingOptOut: optOut } });
}

/**
 * Every non-staff customer who hasn't opted out — the base pool the
 * marketing sender's segment audiences filter down from (see
 * features/marketing-email/audience.ts, which computes each customer's
 * segment from the order stats fetched alongside this).
 */
export async function listCustomersForMarketing() {
  return prisma.user.findMany({
    where: { role: "user", marketingOptOut: false },
    select: { id: true, name: true, email: true },
  });
}
