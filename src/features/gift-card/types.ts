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
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
}
