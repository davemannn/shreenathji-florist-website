export interface AdminCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt?: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}
