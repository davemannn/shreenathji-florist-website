import type { AdminRole } from "@/server/auth/permissions";
import type { OrderStatus } from "./types";

/**
 * Pure logic, no server deps — shared between the server action (the real
 * enforcement boundary) and the order detail UI (which buttons to even show).
 */
const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const CANCELLABLE_FROM: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING"];

/**
 * delivery_guy only ever moves an order along the last two legs of the
 * delivery itself — everything before that (confirming, processing) and
 * cancellation is staff-only.
 */
export function allowedNextStatuses(role: AdminRole, current: OrderStatus): OrderStatus[] {
  if (current === "DELIVERED" || current === "CANCELLED") return [];

  if (role === "delivery_guy") {
    if (current === "PROCESSING") return ["OUT_FOR_DELIVERY"];
    if (current === "OUT_FOR_DELIVERY") return ["DELIVERED"];
    return [];
  }

  const index = ORDER_STATUS_FLOW.indexOf(current);
  const next: OrderStatus[] = [];
  if (index >= 0 && index < ORDER_STATUS_FLOW.length - 1) {
    next.push(ORDER_STATUS_FLOW[index + 1]);
  }
  if (CANCELLABLE_FROM.includes(current)) {
    next.push("CANCELLED");
  }
  return next;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
