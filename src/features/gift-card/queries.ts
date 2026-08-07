import {
  findGiftCardByIdAdmin,
  listGiftCardsAdmin as listGiftCardsAdminRepo,
  type ListGiftCardsAdminParams,
} from "@/server/repositories/gift-card.repository";
import type { AdminGiftCard } from "./types";

type GiftCardRow = Awaited<ReturnType<typeof listGiftCardsAdminRepo>>[number];
type GiftCardDetailRow = NonNullable<Awaited<ReturnType<typeof findGiftCardByIdAdmin>>>;

function toAdminGiftCard(card: GiftCardRow): AdminGiftCard {
  return {
    id: card.id,
    code: card.code,
    amount: card.amount,
    balance: card.balance,
    purchaserId: card.purchaserId,
    purchaserName: card.purchaser.name,
    purchaserEmail: card.purchaser.email,
    recipientType: card.recipientType,
    recipientName: card.recipientName ?? undefined,
    recipientEmail: card.recipientEmail ?? undefined,
    recipientPhone: card.recipientPhone ?? undefined,
    message: card.message ?? undefined,
    deliveryDate: card.deliveryDate?.toISOString(),
    paymentStatus: card.paymentStatus,
    createdAt: card.createdAt.toISOString(),
  };
}

export type ListGiftCardsAdminQueryParams = ListGiftCardsAdminParams;

export async function listGiftCardsAdmin(
  params: ListGiftCardsAdminQueryParams = {},
): Promise<AdminGiftCard[]> {
  const cards = await listGiftCardsAdminRepo(params);
  return cards.map(toAdminGiftCard);
}

export async function getGiftCardForAdmin(id: string): Promise<AdminGiftCard | null> {
  const card = await findGiftCardByIdAdmin(id);
  if (!card) return null;
  return {
    ...toAdminGiftCard(card as GiftCardDetailRow),
    adjustments: card.adjustments.map((adjustment) => ({
      id: adjustment.id,
      amount: adjustment.amount,
      reason: adjustment.reason,
      adjustedByName: adjustment.adjustedBy.name,
      createdAt: adjustment.createdAt.toISOString(),
    })),
  };
}
