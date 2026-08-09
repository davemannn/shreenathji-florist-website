import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { SubscriptionPlanForm } from "@/features/subscription/components/subscription-plan-form";

export const metadata: Metadata = {
  title: "New Subscription Plan",
};

export default async function NewSubscriptionPlanPage() {
  await requireAdminSession("subscriptions:manage");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Subscription Plan</h1>
      <SubscriptionPlanForm />
    </div>
  );
}
