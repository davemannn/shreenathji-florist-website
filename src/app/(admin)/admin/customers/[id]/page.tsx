import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cake, Heart, Bell } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getCustomerForAdmin } from "@/features/customer/queries";
import { SegmentBadge } from "@/features/customer/components/segment-badge";
import { CustomerTags } from "@/features/customer/components/customer-tags";
import { getRemindersForUser } from "@/features/reminder/queries";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Customer",
};

const MONTH_LABEL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const OCCASION_ICON = { BIRTHDAY: Cake, ANNIVERSARY: Heart, OTHER: Bell };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminCustomerDetailPage({
  params,
}: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  await requireAdminSession("customers:view");

  const customer = await getCustomerForAdmin(id);
  if (!customer) notFound();
  const reminders = await getRemindersForUser(customer.id);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <p className="text-muted-foreground text-sm">
            {customer.email} {customer.phone ? `· ${customer.phone}` : ""}
          </p>
          <p className="text-muted-foreground text-xs">Joined {formatDate(customer.joinedAt)}</p>
        </div>
        <SegmentBadge segment={customer.segment} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border-border rounded-md border p-4">
          <p className="text-muted-foreground text-xs">Lifetime Orders</p>
          <p className="mt-1 text-xl font-semibold">{customer.lifetimeOrderCount}</p>
        </div>
        <div className="border-border rounded-md border p-4">
          <p className="text-muted-foreground text-xs">Lifetime Spend</p>
          <p className="mt-1 text-xl font-semibold">{formatINR(customer.lifetimeSpent)}</p>
        </div>
        <div className="border-border rounded-md border p-4">
          <p className="text-muted-foreground text-xs">Wallet Balance</p>
          <p className="mt-1 text-xl font-semibold">{formatINR(customer.walletBalance)}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">Tags</h2>
        <CustomerTags userId={customer.id} tags={customer.tags} />
      </div>

      {customer.addresses.length > 0 ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Addresses</h2>
          <ul className="flex flex-col gap-2">
            {customer.addresses.map((address) => (
              <li key={address.id} className="border-border rounded-md border p-3 text-sm">
                {address.label ? <span className="font-medium">{address.label} — </span> : null}
                {address.line1}, {address.city}, {address.state}
                {address.isDefault ? (
                  <Badge variant="secondary" className="ml-2">
                    Default
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {reminders.length > 0 ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Reminders</h2>
          <p className="text-muted-foreground mb-2 text-xs">
            Saved by the customer — a personal call or note ahead of the date goes a long way.
          </p>
          <ul className="flex flex-col gap-2">
            {reminders.map((reminder) => {
              const Icon = OCCASION_ICON[reminder.occasion];
              return (
                <li
                  key={reminder.id}
                  className="border-border flex items-center gap-3 rounded-md border p-3 text-sm"
                >
                  <Icon className="text-brand size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-medium">{reminder.recipientName}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      — {MONTH_LABEL[reminder.month - 1]} {reminder.day}
                      {reminder.note ? ` · ${reminder.note}` : ""}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div>
        <h2 className="mb-2 text-sm font-semibold">Recent Orders</h2>
        {customer.recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {customer.recentOrders.map((order) => (
              <li
                key={order.id}
                className="border-border flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-brand font-medium hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(order.createdAt)} · {order.itemCount} item
                    {order.itemCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatINR(order.total)}</p>
                  <Badge variant="outline" className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
