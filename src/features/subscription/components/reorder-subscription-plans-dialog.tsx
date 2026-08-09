"use client";

import { ReorderDialog } from "@/components/shared/reorder-dialog";
import { reorderSubscriptionPlansAction } from "../actions";
import type { AdminSubscriptionPlan } from "../types";

export function ReorderSubscriptionPlansDialog({ plans }: { plans: AdminSubscriptionPlan[] }) {
  return (
    <ReorderDialog
      items={plans}
      getId={(plan) => plan.id}
      renderRow={(plan) => <span className="truncate">{plan.name}</span>}
      onSave={reorderSubscriptionPlansAction}
      title="Reorder subscription plans"
      description="Drag rows into place, or use the arrows. This is the order they appear on the /subscriptions page."
    />
  );
}
