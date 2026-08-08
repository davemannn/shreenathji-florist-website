import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { confirmNewsletterSubscriptionAction } from "@/features/newsletter/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Confirm Subscription",
};

export default async function NewsletterConfirmPage({
  searchParams,
}: PageProps<"/newsletter/confirm">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  const { success } = token ? await confirmNewsletterSubscriptionAction(token) : { success: false };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      {success ? (
        <>
          <CheckCircle2 className="text-brand size-12" aria-hidden="true" />
          <h1 className="text-2xl">You&rsquo;re subscribed!</h1>
          <p className="text-muted-foreground text-sm">
            Thanks for confirming — you&rsquo;ll start hearing from us about offers and new
            arrivals.
          </p>
        </>
      ) : (
        <>
          <XCircle className="text-destructive size-12" aria-hidden="true" />
          <h1 className="text-2xl">Link expired or invalid</h1>
          <p className="text-muted-foreground text-sm">
            This confirmation link didn&rsquo;t work. You can subscribe again from the footer of any
            page.
          </p>
        </>
      )}
      <Button variant="brand" nativeButton={false} render={<Link href="/" />}>
        Back to home
      </Button>
    </div>
  );
}
