import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/server/auth/config";
import { findGiftCardByCode } from "@/server/repositories/gift-card.repository";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Gift Card Confirmed",
};

export default async function GiftCardConfirmationPage({
  params,
}: PageProps<"/gift-cards/[code]">) {
  const { code } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/sign-in?redirectTo=/gift-cards/${code}`);
  }

  const giftCard = await findGiftCardByCode(code, session.user.id);
  if (!giftCard) notFound();

  const isForSelf = giftCard.recipientType === "SELF";

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center md:px-6 lg:px-8">
      <CheckCircle2 className="text-brand mx-auto size-14" aria-hidden="true" />
      <h1 className="mt-4 text-3xl md:text-4xl">
        {giftCard.paymentStatus === "PAID" ? "Gift Card Sent!" : "Almost There"}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {giftCard.paymentStatus === "PAID"
          ? isForSelf
            ? "Your gift card is ready — check your email for the code."
            : `We've emailed the gift card to ${giftCard.recipientName ?? "your recipient"}.`
          : "We're still confirming your payment — refresh in a moment."}
      </p>

      <div className="border-border mt-8 flex flex-col gap-3 rounded-xs border p-8">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">Gift Card Value</p>
        <p className="text-3xl font-semibold">{formatINR(giftCard.amount)}</p>
        <p className="text-muted-foreground text-sm tracking-[0.15em]">{giftCard.code}</p>
        {giftCard.message ? (
          <p className="text-muted-foreground mt-2 border-t pt-3 text-sm italic">
            &ldquo;{giftCard.message}&rdquo;
          </p>
        ) : null}
      </div>

      <Button
        variant="brand"
        size="lg"
        className="mt-8"
        nativeButton={false}
        render={<Link href="/shop" />}
      >
        Continue Shopping
      </Button>
    </div>
  );
}
