export type SubscriptionPlanCategory = "DAILY_POOJA" | "WEEKLY_FLOWERS" | "RAW_FLOWERS" | "CUSTOM";
export type BillingInterval = "WEEKLY" | "MONTHLY" | "ANNUAL";
export type SubscriptionStatus =
  | "CREATED"
  | "AUTHENTICATED"
  | "ACTIVE"
  | "PENDING"
  | "HALTED"
  | "PAUSED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export interface SubscriptionPlanIntervalOption {
  id: string;
  interval: BillingInterval;
  price: number;
  discountPercent: number;
}

/** Storefront-facing — what /subscriptions actually shows. */
export interface SubscriptionPlanDisplay {
  id: string;
  name: string;
  description: string;
  category: SubscriptionPlanCategory;
  imageUrl?: string;
  intervals: SubscriptionPlanIntervalOption[];
}

/** A signed-in customer's own subscription — "My Subscriptions" on the account page. */
export interface CustomerSubscriptionSummary {
  id: string;
  planName: string;
  planImageUrl?: string;
  interval: BillingInterval;
  price: number;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  razorpaySubscriptionId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Admin panel.
// ---------------------------------------------------------------------------

export interface AdminSubscriptionPlanInterval {
  id: string;
  interval: BillingInterval;
  price: number;
  discountPercent: number;
  razorpayPlanId?: string;
}

export interface AdminSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  category: SubscriptionPlanCategory;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  intervals: AdminSubscriptionPlanInterval[];
}

export interface AdminCustomerSubscription {
  id: string;
  userName: string;
  userEmail: string;
  planName: string;
  interval: BillingInterval;
  price: number;
  status: SubscriptionStatus;
  recipientName: string;
  recipientPhone: string;
  currentPeriodEnd?: string;
  createdAt: string;
}
