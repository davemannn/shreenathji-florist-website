import { MapPinOff } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * Shown instead of the payment step when the selected address's geocode
 * (only present when picked via the Places autocomplete) puts it outside
 * StoreSettings.deliveryRadiusKm. Blocks checkout entirely rather than just
 * warning — the same distance is re-checked server-side in
 * order.service.ts's placeOrder, so this is UX, not the actual gate.
 */
export function DeliveryServiceabilityNotice({
  distanceKm,
  radiusKm,
}: {
  distanceKm: number;
  radiusKm: number;
}) {
  return (
    <section className="border-destructive/30 bg-destructive/5 rounded-xs border p-4">
      <div className="flex items-start gap-3">
        <MapPinOff className="text-destructive mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">This address is outside our delivery area</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            This location is about {Math.round(distanceKm)} km from our store — we currently deliver
            within {radiusKm} km. You&rsquo;re welcome to{" "}
            <a
              href={siteConfig.contact.phoneHref}
              className="text-brand underline underline-offset-2"
            >
              call us at {siteConfig.contact.phone}
            </a>{" "}
            to check if delivery can be arranged, or you can pick up your order or visit the store
            directly.
          </p>
        </div>
      </div>
    </section>
  );
}
