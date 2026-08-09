import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listSubscriptionPlansAdmin } from "@/features/subscription/queries";
import { SubscriptionPlansTable } from "@/features/subscription/components/subscription-plans-table";
import { ReorderSubscriptionPlansDialog } from "@/features/subscription/components/reorder-subscription-plans-dialog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Subscription Plans",
};

export default async function AdminSubscriptionPlansPage() {
  await requireAdminSession("subscriptions:manage");
  const plans = await listSubscriptionPlansAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscription Plans</h1>
          <p className="text-muted-foreground text-sm">
            {plans.length} plans — the catalog shown on /subscriptions.{" "}
            <Link href="/admin/subscriptions" className="text-brand underline underline-offset-2">
              View subscribers
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReorderSubscriptionPlansDialog plans={plans} />
          <Button
            variant="brand"
            nativeButton={false}
            render={<Link href="/admin/subscriptions/plans/new" />}
          >
            <Plus className="size-4" aria-hidden="true" />
            New Plan
          </Button>
        </div>
      </div>

      <SubscriptionPlansTable plans={plans} />
    </div>
  );
}
