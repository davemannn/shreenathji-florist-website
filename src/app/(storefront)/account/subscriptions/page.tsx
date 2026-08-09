import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { getMySubscriptions } from "@/features/subscription/queries";
import { SubscriptionStatusBadge } from "@/features/subscription/components/subscription-status-badge";
import { CancelSubscriptionButton } from "@/features/subscription/components/cancel-subscription-button";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your Subscriptions",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CANCELLABLE_STATUSES = ["ACTIVE", "AUTHENTICATED", "PENDING", "HALTED"];

export default async function AccountSubscriptionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in?redirectTo=/account/subscriptions");
  }

  const subscriptions = await getMySubscriptions(session.user.id);

  if (subscriptions.length === 0) {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-xs border p-10 text-center">
        <p className="text-muted-foreground text-sm">
          You don&rsquo;t have any flower subscriptions yet.
        </p>
        <Button variant="brand" nativeButton={false} render={<Link href="/subscriptions" />}>
          Browse Subscriptions
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {subscriptions.map((sub) => (
        <div key={sub.id} className="border-border flex items-center gap-4 rounded-xs border p-4">
          {sub.planImageUrl ? (
            <Image
              src={sub.planImageUrl}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="bg-muted size-16 shrink-0 rounded-md" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{sub.planName}</p>
              <SubscriptionStatusBadge status={sub.status} />
            </div>
            <p className="text-muted-foreground text-sm">
              {formatINR(sub.price)} / {sub.interval.toLowerCase()}
            </p>
            {sub.currentPeriodEnd ? (
              <p className="text-muted-foreground text-xs">
                Next billing: {formatDate(sub.currentPeriodEnd)}
              </p>
            ) : null}
          </div>
          {CANCELLABLE_STATUSES.includes(sub.status) ? (
            <CancelSubscriptionButton subscriptionId={sub.id} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
