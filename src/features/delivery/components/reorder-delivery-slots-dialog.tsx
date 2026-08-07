"use client";

import { ReorderDialog } from "@/components/shared/reorder-dialog";
import { reorderDeliverySlotsAction } from "../actions";
import type { AdminDeliverySlot } from "../types";

export function ReorderDeliverySlotsDialog({ slots }: { slots: AdminDeliverySlot[] }) {
  return (
    <ReorderDialog
      items={slots}
      getId={(slot) => slot.id}
      renderRow={(slot) => <span className="truncate">{slot.label}</span>}
      onSave={reorderDeliverySlotsAction}
      title="Reorder delivery slots"
      description="Drag rows into place, or use the arrows. This is the order slots appear in at checkout."
    />
  );
}
