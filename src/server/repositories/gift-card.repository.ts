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
