import type { Metadata } from "next";
import Link from "next/link";
import { Moon, Clock, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { MIDNIGHT_CHARGE, MIDNIGHT_CUTOFF_HOUR } from "@/lib/delivery";

export const metadata: Metadata = {
  title: "Midnight Delivery",
  description:
    "Be the first to wish someone on their birthday or anniversary — midnight delivery between 11:30 PM and 12:30 AM.",
};

const cutoff12h =
  MIDNIGHT_CUTOFF_HOUR > 12 ? `${MIDNIGHT_CUTOFF_HOUR - 12} PM` : `${MIDNIGHT_CUTOFF_HOUR} AM`;

export default function MidnightDeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <Moon className="text-brand mx-auto size-10" aria-hidden="true" />
        <p className="text-brand mt-4 text-xs font-semibold tracking-[0.2em] uppercase">
          Midnight Delivery
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl">Be Their First Wish</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm md:text-base">
          Nothing beats being the very first to celebrate someone — our rider arrives right as the
          clock strikes twelve, between 11:30 PM and 12:30 AM.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="border-border rounded-xs border p-5 text-center">
          <Clock className="text-brand mx-auto size-6" aria-hidden="true" />
          <p className="mt-3 font-medium">Book Before {cutoff12h}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            For delivery tonight, place your order before {cutoff12h} — this gives our team time to
            prepare and route it. Booking for a future date has no such cutoff.
          </p>
        </div>
        <div className="border-border rounded-xs border p-5 text-center">
          <Moon className="text-brand mx-auto size-6" aria-hidden="true" />
          <p className="mt-3 font-medium">{formatINR(MIDNIGHT_CHARGE)} Flat Fee</p>
          <p className="text-muted-foreground mt-1 text-sm">
            One flat charge covers the special-hours delivery, whichever date you choose.
          </p>
        </div>
        <div className="border-border rounded-xs border p-5 text-center">
          <PartyPopper className="text-brand mx-auto size-6" aria-hidden="true" />
          <p className="mt-3 font-medium">Best For</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Birthdays, anniversaries — any moment that matters more at exactly midnight.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Button variant="brand" size="lg" nativeButton={false} render={<Link href="/shop" />}>
          Shop Midnight Gifts
        </Button>
      </div>
    </div>
  );
}
