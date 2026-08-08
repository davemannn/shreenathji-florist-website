import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { unsubscribeFromMarketingAction } from "@/features/marketing-email/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Unsubscribe",
};

/** The segment-recipient equivalent of /newsletter/unsubscribe — reached from marketing emails sent to a customer segment (not the newsletter list), see marketing-unsubscribe-token.ts for how uid+token is verified without a stored token column. */
export default async function MarketingUnsubscribePage({
  searchParams,
}: PageProps<"/marketing/unsubscribe">) {
  const params = await searchParams;
  const uid = typeof params.uid === "string" ? params.uid : undefined;
  const token = typeof params.token === "string" ? params.token : undefined;
  const { success } =
    uid && token ? await unsubscribeFromMarketingAction(uid, token) : { success: false };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      {success ? (
        <>
          <CheckCircle2 className="text-brand size-12" aria-hidden="true" />
          <h1 className="text-2xl">You&rsquo;ve been unsubscribed</h1>
          <p className="text-muted-foreground text-sm">
            You won&rsquo;t receive marketing emails from us anymore. You&rsquo;ll still get order
            and account emails.
          </p>
        </>
      ) : (
        <>
          <XCircle className="text-destructive size-12" aria-hidden="true" />
          <h1 className="text-2xl">Link expired or invalid</h1>
          <p className="text-muted-foreground text-sm">
            This unsubscribe link didn&rsquo;t work. Contact us and we&rsquo;ll remove you manually.
          </p>
        </>
      )}
      <Button variant="brand" nativeButton={false} render={<Link href="/" />}>
        Back to home
      </Button>
    </div>
  );
}
