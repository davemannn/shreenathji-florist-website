// Computed segments — derived live from order history on every read rather
// than stored, so they're never stale (a customer's segment updates itself
// the moment they place another order, no batch job needed). Manual tags
// (CustomerTag) are the separate, admin-assigned complement for anything
// these rules can't capture (e.g. "wedding season lead").

export type CustomerSegment = "VIP" | "Frequent" | "Inactive" | "New" | "Regular";

/** ₹ lifetime spend to be considered VIP — adjust here if it stops feeling right as the business grows. */
export const VIP_SPEND_THRESHOLD = 10_000;
/** Lifetime orders to be considered a Frequent buyer, provided they're still recently active (see INACTIVE_DAYS). */
export const FREQUENT_ORDER_THRESHOLD = 3;
/** Days since their last order before someone is considered Inactive. */
export const INACTIVE_DAYS = 90;

export interface CustomerStats {
  lifetimeSpent: number;
  lifetimeOrderCount: number;
  lastOrderAt: Date | null;
}

export function computeCustomerSegment(stats: CustomerStats): CustomerSegment {
  if (stats.lifetimeOrderCount === 0) return "New";

  const daysSinceLastOrder = stats.lastOrderAt
    ? (Date.now() - stats.lastOrderAt.getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;

  if (stats.lifetimeSpent >= VIP_SPEND_THRESHOLD) return "VIP";
  if (daysSinceLastOrder > INACTIVE_DAYS) return "Inactive";
  if (stats.lifetimeOrderCount >= FREQUENT_ORDER_THRESHOLD) return "Frequent";
  return "Regular";
}
