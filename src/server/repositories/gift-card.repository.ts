import { prisma } from "@/server/db/prisma";

export interface CreateGiftCardInput {
  code: string;
  amount: number;
  purchaserId: string;
  recipientType: "SELF" | "OTHER";
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  message?: string;
  deliveryDate?: Date;
}

export async function createGiftCard(input: CreateGiftCardInput) {
  return prisma.giftCard.create({
    data: { ...input, balance: input.amount },
  });
}

/** Scoped by purchaserId — never trust a client-supplied code alone before reading/mutating. */
export async function findGiftCardByCode(code: string, purchaserId: string) {
  return prisma.giftCard.findFirst({ where: { code, purchaserId } });
}

export async function findGiftCardById(id: string, purchaserId: string) {
  return prisma.giftCard.findFirst({ where: { id, purchaserId } });
}

export async function attachRazorpayOrderId(giftCardId: string, razorpayOrderId: string) {
  return prisma.giftCard.update({ where: { id: giftCardId }, data: { razorpayOrderId } });
}

export async function markGiftCardPaid(giftCardId: string, razorpayPaymentId: string) {
  return prisma.giftCard.update({
    where: { id: giftCardId },
    data: { paymentStatus: "PAID", razorpayPaymentId },
  });
}

export async function listGiftCardsForUser(purchaserId: string) {
  return prisma.giftCard.findMany({
    where: { purchaserId },
    orderBy: { createdAt: "desc" },
  });
}

// ---------------------------------------------------------------------------
// Admin panel — marketing/content management (Phase 4).
// ---------------------------------------------------------------------------

export interface ListGiftCardsAdminParams {
  search?: string;
}

export async function listGiftCardsAdmin(params: ListGiftCardsAdminParams = {}) {
  const { search } = params;
  const where = search
    ? {
        OR: [
          { code: { contains: search } },
          { recipientName: { contains: search } },
          { recipientEmail: { contains: search } },
          { purchaser: { email: { contains: search } } },
        ],
      }
    : {};

  return prisma.giftCard.findMany({
    where,
    include: { purchaser: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function findGiftCardByIdAdmin(id: string) {
  return prisma.giftCard.findUnique({
    where: { id },
    include: {
      purchaser: { select: { id: true, name: true, email: true } },
      adjustments: {
        include: { adjustedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export interface IssueGiftCardInput {
  code: string;
  amount: number;
  purchaserId: string;
  recipientType: "SELF" | "OTHER";
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  message?: string;
  reason: string;
  issuedByUserId: string;
}

/**
 * Manually issues a gift card with no real payment behind it (Super Admin
 * only, see gift_cards:issue) — marked PAID immediately (there's no
 * Razorpay order to wait on), and the amount is recorded as the first
 * GiftCardAdjustment so the audit trail is complete from creation, not just
 * from the first later adjustment.
 */
export async function issueGiftCard(input: IssueGiftCardInput) {
  const { reason, issuedByUserId, ...cardInput } = input;
  return prisma.$transaction(async (tx) => {
    const card = await tx.giftCard.create({
      data: { ...cardInput, balance: cardInput.amount, paymentStatus: "PAID" },
    });
    await tx.giftCardAdjustment.create({
      data: {
        giftCardId: card.id,
        amount: cardInput.amount,
        reason,
        adjustedByUserId: issuedByUserId,
      },
    });
    return card;
  });
}

/**
 * Signed delta (positive credits, negative debits) — refuses to push the
 * balance negative rather than letting a fat-fingered debit silently create
 * a negative-balance card.
 */
export async function adjustGiftCardBalance(
  giftCardId: string,
  delta: number,
  reason: string,
  adjustedByUserId: string,
) {
  return prisma.$transaction(async (tx) => {
    const card = await tx.giftCard.findUniqueOrThrow({ where: { id: giftCardId } });
    const nextBalance = card.balance + delta;
    if (nextBalance < 0) {
      throw new Error(`This would take the balance below ₹0 (current balance: ₹${card.balance}).`);
    }
    await tx.giftCardAdjustment.create({
      data: { giftCardId, amount: delta, reason, adjustedByUserId },
    });
    return tx.giftCard.update({ where: { id: giftCardId }, data: { balance: nextBalance } });
  });
}
