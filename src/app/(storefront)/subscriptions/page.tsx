import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import { getSubscriptionPlans } from "@/features/subscription/queries";
import { SubscriptionPlanCard } from "@/features/subscription/components/subscription-plan-card";
import { listAddressesForUser } from "@/server/repositories/address.repository";

export const metadata: Metadata = {
  title: "Flower Subscriptions",
  description:
    "Subscribe to daily pooja flowers, weekly fresh flower boxes, or raw flower deliveries — weekly, monthly, or annual plans, with a discount for longer commitments.",
};

// Admin-managed plan catalog — never baked into the build, same reasoning
// as the homepage/gallery/faq pages.
export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [plans, addressRows] = await Promise.all([
    getSubscriptionPlans(),
    session ? listAddressesForUser(session.user.id) : Promise.resolve([]),
  ]);

  const defaultAddressRow = addressRows.find((a) => a.isDefault) ?? addressRows[0];
  const defaultAddress = defaultAddressRow
    ? {
        id: defaultAddressRow.id,
        label: defaultAddressRow.label ?? undefined,
        recipientName: defaultAddressRow.recipientName,
        recipientPhone: defaultAddressRow.recipientPhone,
        line1: defaultAddressRow.line1,
        line2: defaultAddressRow.line2 ?? undefined,
        city: defaultAddressRow.city,
        state: defaultAddressRow.state,
        pincode: defaultAddressRow.pincode,
        isDefault: defaultAddressRow.isDefault,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">
          Subscribe & Save
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl">Flower Subscriptions</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm md:text-base">
          Fresh flowers on your schedule — daily pooja flowers, weekly bouquet boxes, or raw flowers
          in bulk. Pick weekly, monthly, or annual billing; longer plans save more. Cancel anytime.
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">
          No subscription plans available right now — check back soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              defaultAddress={defaultAddress}
              isSignedIn={!!session}
            />
          ))}
        </div>
      )}
    </div>
  );
}
