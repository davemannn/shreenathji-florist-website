import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "../types";

const VARIANT: Record<SubscriptionStatus, "secondary" | "outline" | "destructive"> = {
  CREATED: "outline",
  AUTHENTICATED: "outline",
  ACTIVE: "secondary",
  PENDING: "outline",
  HALTED: "destructive",
  CANCELLED: "outline",
  COMPLETED: "secondary",
  EXPIRED: "outline",
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge variant={VARIANT[status]}>{status}</Badge>;
}
