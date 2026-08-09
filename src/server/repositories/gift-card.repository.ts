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

/**
 * Marks payment complete, then — for a SELF-purchase only — immediately
 * redeems the card into the purchaser's own wallet, no separate claim step
 * needed since there's no ambiguity about who it's for. An OTHER (gifted)
 * card stays unredeemed (balance intact) until the recipient enters the
 * code themselves — see redeemGiftCardByCode.
 */
export async function markGiftCardPaid(giftCardId: string, razorpayPaymentId: string) {
  return prisma.$transaction(async (tx) => {
    const card = await tx.giftCard.update({
      where: { id: giftCardId },
      data: { paymentStatus: "PAID", razorpayPaymentId },
    });

    if (card.recipientType !== "SELF") return card;

    await tx.user.update({
      where: { id: card.purchaserId },
      data: { walletBalance: { increment: card.balance } },
    });
    return tx.giftCard.update({
      where: { id: giftCardId },
      data: { redeemedAt: new Date(), redeemedByUserId: card.purchaserId, balance: 0 },
    });
  });
}

/**
 * Self-service redemption for a gifted (OTHER-recipient) card — the
 * recipient enters the code themselves. All-or-nothing: the full balance
 * moves into the redeemer's wallet in one shot, not spent piecemeal
 * per-order the way a coupon is. Throws messages safe to show directly to
 * the customer.
 */
export async function redeemGiftCardByCode(code: string, redeemingUserId: string) {
  return prisma.$transaction(async (tx) => {
    const card = await tx.giftCard.findUnique({ where: { code } });
    if (!card) {
      throw new Error("That gift card code wasn't found — double-check and try again.");
    }
    if (card.paymentStatus !== "PAID") {
      throw new Error("This gift card hasn't been paid for yet.");
    }
    if (card.redeemedAt) {
      throw new Error(
        card.redeemedByUserId === redeemingUserId
          ? "You've already redeemed this gift card."
          : "This gift card has already been redeemed.",
      );
    }

    const creditedAmount = card.balance;

    await tx.user.update({
      where: { id: redeemingUserId },
      data: { walletBalance: { increment: creditedAmount } },
    });

    const updated = await tx.giftCard.update({
      where: { id: card.id },
      data: { redeemedAt: new Date(), redeemedByUserId: redeemingUserId, balance: 0 },
    });

    // Report what was actually credited, not `amount` — a card whose
    // balance was adjusted (by admin) before being claimed could have a
    // different balance than its original amount.
    return { ...updated, creditedAmount };
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
    include: {
      purchaser: { select: { id: true, name: true, email: true } },
      redeemedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findGiftCardByIdAdmin(id: string) {
  return prisma.giftCard.findUnique({
    where: { id },
    include: {
      purchaser: { select: { id: true, name: true, email: true } },
      redeemedBy: { select: { name: true, email: true } },
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
 * only, see gift_cards:issue) — marked PAID and redeemed to the resolved
 * account's wallet immediately (there's no Razorpay order to wait on, and
 * unlike a storefront purchase there's no ambiguity about which account it
 * belongs to — purchaserEmail always resolves to one specific existing
 * user regardless of recipientType). The amount is recorded as the first
 * GiftCardAdjustment so the audit trail is complete from creation, not just
 * from the first later adjustment.
 */
export async function issueGiftCard(input: IssueGiftCardInput) {
  const { reason, issuedByUserId, ...cardInput } = input;
  return prisma.$transaction(async (tx) => {
    const card = await tx.giftCard.create({
      data: {
        ...cardInput,
        balance: 0,
        paymentStatus: "PAID",
        redeemedAt: new Date(),
        redeemedByUserId: cardInput.purchaserId,
      },
    });
    await tx.giftCardAdjustment.create({
      data: {
        giftCardId: card.id,
        amount: cardInput.amount,
        reason,
        adjustedByUserId: issuedByUserId,
      },
    });
    await tx.user.update({
      where: { id: cardInput.purchaserId },
      data: { walletBalance: { increment: cardInput.amount } },
    });
    return card;
  });
}

/**
 * Signed delta (positive credits, negative debits) — refuses to push the
 * balance negative rather than letting a fat-fingered debit silently create
 * a negative-balance card. Only meaningful before redemption — once a card
 * has moved into someone's wallet its own balance is permanently 0, so
 * this refuses to touch it (adjust the wallet directly instead, if ever
 * needed).
 */
export async function adjustGiftCardBalance(
  giftCardId: string,
  delta: number,
  reason: string,
  adjustedByUserId: string,
) {
  return prisma.$transaction(async (tx) => {
    const card = await tx.giftCard.findUniqueOrThrow({ where: { id: giftCardId } });
    if (card.redeemedAt) {
      throw new Error(
        "This gift card has already been redeemed to a wallet — its own balance can't be adjusted anymore.",
      );
    }
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
