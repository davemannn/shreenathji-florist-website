import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { findUserById } from "@/server/repositories/user.repository";
import { listOrdersForUser } from "@/server/repositories/order.repository";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { WalletCard } from "@/features/account/components/wallet-card";
import { RedeemGiftCardForm } from "@/features/gift-card/components/redeem-gift-card-form";
import { ACTIVE_ORDER_STATUSES } from "@/features/account/types";

export const metadata: Metadata = {
  title: "Your Account",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in?redirectTo=/account");
  }

  const [user, orders] = await Promise.all([
    findUserById(session.user.id),
    listOrdersForUser(session.user.id),
  ]);

  const activeCount = orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status)).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium">{user?.name ?? session.user.name}</p>
        <p className="text-muted-foreground text-sm">{user?.email ?? session.user.email}</p>
      </div>

      <WalletCard balance={user?.walletBalance ?? 0} />
      <RedeemGiftCardForm />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="border-border hover:bg-muted rounded-xs border p-5 transition-colors"
        >
          <p className="text-2xl font-semibold">{activeCount}</p>
          <p className="text-muted-foreground text-sm">
            Active order{activeCount === 1 ? "" : "s"}
          </p>
        </Link>
        <Link
          href="/account/orders"
          className="border-border hover:bg-muted rounded-xs border p-5 transition-colors"
        >
          <p className="text-2xl font-semibold">{orders.length}</p>
          <p className="text-muted-foreground text-sm">Total orders placed</p>
        </Link>
        <Link
          href="/account/subscriptions"
          className="border-border hover:bg-muted rounded-xs border p-5 transition-colors"
        >
          <p className="text-sm font-medium">Flower Subscriptions</p>
          <p className="text-muted-foreground text-sm">Manage recurring deliveries.</p>
        </Link>
        <Link
          href="/account/reminders"
          className="border-border hover:bg-muted rounded-xs border p-5 transition-colors"
        >
          <p className="text-sm font-medium">Reminders</p>
          <p className="text-muted-foreground text-sm">Never miss a birthday or anniversary.</p>
        </Link>
      </div>

      <div className="border-t pt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
