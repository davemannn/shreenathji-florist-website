export interface GiftCardDetail {
  id: string;
  code: string;
  amount: number;
  balance: number;
  recipientType: "SELF" | "OTHER";
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  deliveryDate?: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  createdAt: string;
  /** Set once the card's value has moved into someone's wallet — see redeemGiftCardAction. */
  redeemedAt?: string;
}

// ---------------------------------------------------------------------------
// Admin panel — marketing/content management (Phase 4).
// ---------------------------------------------------------------------------

export interface AdminGiftCardAdjustment {
  id: string;
  amount: number;
  reason: string;
  adjustedByName: string;
  createdAt: string;
}

export interface AdminGiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  purchaserId: string;
  purchaserName: string;
  purchaserEmail: string;
  recipientType: "SELF" | "OTHER";
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  message?: string;
  deliveryDate?: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  createdAt: string;
  redeemedAt?: string;
  redeemedByName?: string;
  redeemedByEmail?: string;
  adjustments?: AdminGiftCardAdjustment[];
}
