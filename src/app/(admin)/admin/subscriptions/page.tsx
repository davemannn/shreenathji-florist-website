import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listSubscriptionsAdmin } from "@/features/subscription/queries";
import { SubscriptionStatusBadge } from "@/features/subscription/components/subscription-status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatINR } from "@/lib/format";
import type { SubscriptionStatus } from "@/features/subscription/types";

export const metadata: Metadata = {
  title: "Subscribers",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_FILTERS: SubscriptionStatus[] = [
  "ACTIVE",
  "CREATED",
  "AUTHENTICATED",
  "PENDING",
  "HALTED",
  "CANCELLED",
  "COMPLETED",
  "EXPIRED",
];

export default async function AdminSubscriptionsPage({
  searchParams,
}: PageProps<"/admin/subscriptions">) {
  await requireAdminSession("subscriptions:manage");
  const params = await searchParams;
  const status =
    typeof params.status === "string" &&
    STATUS_FILTERS.includes(params.status as SubscriptionStatus)
      ? (params.status as SubscriptionStatus)
      : undefined;

  const { subscriptions, total } = await listSubscriptionsAdmin({ status });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscribers</h1>
          <p className="text-muted-foreground text-sm">
            {total} subscription{total === 1 ? "" : "s"}
            {status ? ` · ${status}` : ""} —{" "}
            <Link
              href="/admin/subscriptions/plans"
              className="text-brand underline underline-offset-2"
            >
              Manage plans
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/subscriptions"
          className={
            !status ? "text-brand font-medium underline" : "text-muted-foreground hover:underline"
          }
        >
          All
        </Link>
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/subscriptions?status=${s}`}
            className={
              status === s
                ? "text-brand font-medium underline"
                : "text-muted-foreground hover:underline"
            }
          >
            {s}
          </Link>
        ))}
      </div>

      {subscriptions.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center text-sm">No subscriptions yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead>Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <Link
                    href={`/admin/subscriptions/${sub.id}`}
                    className="text-brand font-medium hover:underline"
                  >
                    {sub.userName}
                  </Link>
                  <p className="text-muted-foreground text-xs">{sub.userEmail}</p>
                </TableCell>
                <TableCell className="text-sm">
                  {sub.planName}
                  <p className="text-muted-foreground text-xs">{sub.interval}</p>
                </TableCell>
                <TableCell>{formatINR(sub.price)}</TableCell>
                <TableCell>
                  <SubscriptionStatusBadge status={sub.status} />
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(sub.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
