import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Gift } from "lucide-react";
import { auth } from "@/server/auth/config";
import { GiftCardForm } from "@/features/gift-card/components/gift-card-form";

export const metadata: Metadata = {
  title: "Gift Cards",
  description:
    "Send a Shreenathji Florist gift card — for yourself or someone else, any amount, delivered by email.",
};

export default async function GiftCardsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in?redirectTo=/gift-cards");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <Gift className="text-brand mx-auto size-10" aria-hidden="true" />
        <p className="text-brand mt-4 text-xs font-semibold tracking-[0.2em] uppercase">
          Gift Cards
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl">Send Flowers, Your Way</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-sm md:text-base">
          Can&apos;t decide what to send? A gift card lets them pick exactly what they love — for
          yourself, or straight to someone else&apos;s inbox.
        </p>
      </div>

      <div className="border-border rounded-xs border p-6 md:p-8">
        <GiftCardForm purchaserName={session.user.name} />
      </div>
    </div>
  );
}
