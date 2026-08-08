import { randomBytes } from "node:crypto";
import { prisma } from "@/server/db/prisma";

function generateToken(): string {
  return randomBytes(24).toString("hex");
}

/**
 * Upsert-on-subscribe — resubscribing after a previous unsubscribe (or
 * re-submitting the footer form before confirming) reactivates the same
 * row rather than erroring on the unique email constraint, and issues a
 * fresh confirmToken each time so an old confirmation email link can't be
 * replayed to "confirm" a since-changed subscription.
 */
export async function upsertNewsletterSubscriber(email: string) {
  const normalized = email.toLowerCase();
  return prisma.newsletterSubscriber.upsert({
    where: { email: normalized },
    update: { confirmToken: generateToken(), unsubscribedAt: null },
    create: {
      email: normalized,
      confirmToken: generateToken(),
      unsubscribeToken: generateToken(),
    },
  });
}

export async function confirmNewsletterSubscriber(confirmToken: string) {
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { confirmToken } });
  if (!subscriber) return null;

  return prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { isConfirmed: true, confirmedAt: new Date() },
  });
}

export async function unsubscribeNewsletterSubscriber(unsubscribeToken: string) {
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken } });
  if (!subscriber) return null;

  return prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { unsubscribedAt: new Date() },
  });
}

/** Confirmed + still-subscribed rows only — the audience the marketing sender (features/marketing-email) actually emails. */
export async function listConfirmedSubscribers() {
  return prisma.newsletterSubscriber.findMany({
    where: { isConfirmed: true, unsubscribedAt: null },
    orderBy: { subscribedAt: "desc" },
  });
}

export interface ListNewsletterSubscribersParams {
  page?: number;
  pageSize?: number;
}

/** Admin list — every row regardless of confirmation/unsubscribe state, so staff can see the full picture. */
export async function listNewsletterSubscribersAdmin(params: ListNewsletterSubscribersParams = {}) {
  const { page = 1, pageSize = 20 } = params;
  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsletterSubscriber.count(),
  ]);
  return { subscribers, total, page, pageSize };
}
