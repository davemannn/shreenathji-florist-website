import { Clock, Moon } from "lucide-react";

/**
 * Static informational block — the real, interactive delivery date/slot
 * picker lives at checkout (tied to the actual order), not here, to avoid
 * two competing "pick a date" controls on the same purchase flow.
 */
export function DeliveryEstimate() {
  return (
    <div className="border-border flex flex-col gap-3 rounded-xs border p-4 text-sm">
      <div className="flex items-center gap-2.5">
        <Clock className="text-brand size-4 shrink-0" aria-hidden="true" />
        <span>Order before 4 PM for same-day delivery in Vadodara.</span>
      </div>
      <div className="flex items-center gap-2.5">
        <Moon className="text-brand size-4 shrink-0" aria-hidden="true" />
        <span>Midnight delivery available — choose your slot at checkout.</span>
      </div>
    </div>
  );
}
