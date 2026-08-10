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
// Refer-a-friend.
// ---------------------------------------------------------------------------

// No 0/O or 1/I — both look alike read off a phone screen when someone's
// typing a friend's code in by hand.
const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += REFERRAL_CODE_ALPHABET[Math.floor(Math.random() * REFERRAL_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Generated lazily (first visit to /account/referral), not at signup —
 * most users never open that page, so most users never need one. Retries
 * on the rare unique-constraint collision (7 chars from a 32-symbol
 * alphabet — astronomically unlikely at this app's scale, but cheap to
 * handle correctly anyway).
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (existing?.referralCode) return existing.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: generateReferralCode() },
        select: { referralCode: true },
      });
      return updated.referralCode as string;
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  throw new Error("Couldn't generate a referral code.");
}

export async function findUserByReferralCode(code: string) {
  return prisma.user.findUnique({ where: { referralCode: code } });
}

/** How many people this user has referred so far — /account/referral's own stat, not tied to whether the reward has paid out yet. */
export async function countReferrals(userId: string): Promise<number> {
  return prisma.user.count({ where: { referredByUserId: userId } });
}

/**
 * Only takes effect if `userId` doesn't already have a referrer — never
 * overwrites an existing relationship. Returns whether it actually applied.
 */
export async function setReferredBy(userId: string, referrerUserId: string): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: { id: userId, referredByUserId: null },
    data: { referredByUserId: referrerUserId },
  });
  return result.count > 0;
}

/**
 * Fires once, right when a referred customer's first order is actually
 * confirmed (see checkout/actions.ts's sendOrderConfirmationEmail) — credits
 * `bonusAmount` to BOTH this user's wallet and their referrer's, atomically,
 * and flips referralRewardGranted so it can never fire twice for the same
 * person. "First order" is approximated as "this user has exactly one Order
 * row at all" (any status) — simple and correct for the overwhelming
 * majority of real signups; the edge case of an old abandoned/cancelled
 * order suppressing a genuine reward is an acceptable trade for not needing
 * a more elaborate qualifying-order definition for what's just a goodwill
 * wallet credit.
 */
export async function grantReferralRewardIfFirstOrder(
  userId: string,
  bonusAmount: number,
): Promise<boolean> {
  if (bonusAmount <= 0) return false;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { referredByUserId: true, referralRewardGranted: true },
    });
    if (!user?.referredByUserId || user.referralRewardGranted) return false;

    const orderCount = await tx.order.count({ where: { userId } });
    if (orderCount !== 1) return false;

    await adjustUserWalletBalance(userId, bonusAmount, tx);
    await adjustUserWalletBalance(user.referredByUserId, bonusAmount, tx);
    await tx.user.update({ where: { id: userId }, data: { referralRewardGranted: true } });
    return true;
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
