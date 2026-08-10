import type { Metadata } from "next";
import { TrackOrderForm } from "@/features/order/components/track-order-form";

export const metadata: Metadata = {
  title: "Track Your Order",
};

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl md:text-4xl">Track Your Order</h1>
      <p className="text-muted-foreground mb-8">
        Enter your order number and the recipient&rsquo;s phone number — no account needed.
      </p>
      <TrackOrderForm />
    </div>
  );
}
