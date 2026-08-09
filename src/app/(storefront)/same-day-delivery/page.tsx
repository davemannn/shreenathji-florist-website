import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { getStoreSettings } from "@/features/settings/queries";
import { findActiveDeliverySlotByType } from "@/server/repositories/delivery-slot.repository";
import { siteConfig } from "@/config/site";

// Reads live delivery-slot pricing from the DB — see cart/page.tsx's
// identical comment for why this needs to be dynamic rather than
// prerendered at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Same Day Delivery",
  description:
    "Order before the cutoff and get flowers, cakes & gifts delivered the same day, anywhere across Vadodara.",
};

export default async function SameDayDeliveryPage() {
  const [{ midnightCutoffHour, baseDeliveryCharge, freeDeliveryThreshold }, expressSlot] =
    await Promise.all([getStoreSettings(), findActiveDeliverySlotByType("FIXED")]);
  const expressCharge = expressSlot?.extraCharge ?? 0;
  const cutoff12h =
    midnightCutoffHour > 12 ? `${midnightCutoffHour - 12} PM` : `${midnightCutoffHour} AM`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <Zap className="text-brand mx-auto size-10" aria-hidden="true" />
        <p className="text-brand mt-4 text-xs font-semibold tracking-[0.2em] uppercase">
          Same Day Delivery
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl">Ordered Today, Delivered Today</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm md:text-base">
          Forgot a date, or just planning something spontaneous? Choose Instant Delivery at checkout
          and we&apos;ll get it there within 2-4 hours, anywhere across Vadodara.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="border-border rounded-xs border p-5 text-center">
          <Clock className="text-brand mx-auto size-6" aria-hidden="true" />
          <p className="mt-3 font-medium">Available Anytime</p>
          <p className="text-muted-foreground mt-1 text-sm">
            No cutoff — order any time of day for delivery within 2-4 hours.
          </p>
        </div>
        <div className="border-border rounded-xs border p-5 text-center">
          <Zap className="text-brand mx-auto size-6" aria-hidden="true" />
          <p className="mt-3 font-medium">+{formatINR(expressCharge)} Express Surcharge</p>
          <p className="text-muted-foreground mt-1 text-sm">
            On top of the standard {formatINR(baseDeliveryCharge)} delivery charge (free above{" "}
            {formatINR(freeDeliveryThreshold)}) — no surprises at checkout. (Ordering after{" "}
            {cutoff12h}? It&apos;s priced the same as Midnight Delivery, since that&apos;s
            realistically when it&apos;ll arrive.)
          </p>
        </div>
        <div className="border-border rounded-xs border p-5 text-center">
          <MapPin className="text-brand mx-auto size-6" aria-hidden="true" />
          <p className="mt-3 font-medium">City-Wide Coverage</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {siteConfig.serviceAreas.join(", ")}, and nearby areas.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Button variant="brand" size="lg" nativeButton={false} render={<Link href="/shop" />}>
          Shop Same-Day Gifts
        </Button>
      </div>
    </div>
  );
}
