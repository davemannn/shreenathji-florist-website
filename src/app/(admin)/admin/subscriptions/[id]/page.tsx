import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getSubscriptionForAdmin } from "@/features/subscription/queries";
import { SubscriptionStatusBadge } from "@/features/subscription/components/subscription-status-badge";
import { AdminCancelSubscriptionDialog } from "@/features/subscription/components/admin-cancel-subscription-dialog";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Subscription Detail",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ACTIVE_STATUSES = ["ACTIVE", "AUTHENTICATED", "PENDING", "HALTED"];

export default async function AdminSubscriptionDetailPage({
  params,
}: PageProps<"/admin/subscriptions/[id]">) {
  const { id } = await params;
  await requireAdminSession("subscriptions:manage");

  const subscription = await getSubscriptionForAdmin(id);
  if (!subscription) notFound();

  const canCancel = ACTIVE_STATUSES.includes(subscription.status);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{subscription.planName}</h1>
          <p className="text-muted-foreground text-sm">
            {subscription.userName} ({subscription.userEmail})
          </p>
        </div>
        <SubscriptionStatusBadge status={subscription.status} />
      </div>

      <section className="border-border grid gap-6 rounded-xs border p-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <h2 className="mb-1 font-semibold">Plan</h2>
          <p className="text-sm">
            {subscription.interval} · {formatINR(subscription.price)} per cycle
          </p>
          <p className="text-muted-foreground text-xs">
            Razorpay subscription: {subscription.razorpaySubscriptionId}
          </p>
          {subscription.currentPeriodEnd ? (
            <p className="text-muted-foreground text-xs">
              Next billing: {formatDate(subscription.currentPeriodEnd)}
            </p>
          ) : null}
          <p className="text-muted-foreground text-xs">
            Started: {formatDate(subscription.createdAt)}
          </p>
          {subscription.cancelledAt ? (
            <p className="text-muted-foreground text-xs">
              Cancelled: {formatDate(subscription.cancelledAt)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="mb-1 font-semibold">Delivery</h2>
          <p className="text-sm">{subscription.recipientName}</p>
          <p className="text-muted-foreground text-sm">{subscription.recipientPhone}</p>
          <p className="text-muted-foreground text-sm">
            {subscription.deliveryLine1}
            {subscription.deliveryLine2 ? `, ${subscription.deliveryLine2}` : ""},{" "}
            {subscription.deliveryCity}, {subscription.deliveryState} {subscription.deliveryPincode}
          </p>
        </div>
      </section>

      {canCancel ? (
        <div>
          <AdminCancelSubscriptionDialog
            subscriptionId={subscription.id}
            razorpaySubscriptionId={subscription.razorpaySubscriptionId}
          />
        </div>
      ) : null}

      <section className="border-border flex flex-col gap-3 rounded-xs border p-5">
        <h2 className="font-semibold">Billing History</h2>
        {subscription.orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No charges yet — this subscription hasn&rsquo;t been authorized/activated, or
            hasn&rsquo;t billed for the first time.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {subscription.orders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-brand font-medium hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</p>
                </div>
                <span className="font-medium">{formatINR(order.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
