import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getSubscriptionPlanForEdit } from "@/features/subscription/queries";
import { SubscriptionPlanForm } from "@/features/subscription/components/subscription-plan-form";

export const metadata: Metadata = {
  title: "Edit Subscription Plan",
};

export default async function EditSubscriptionPlanPage({
  params,
}: PageProps<"/admin/subscriptions/plans/[id]">) {
  const { id } = await params;
  await requireAdminSession("subscriptions:manage");

  const plan = await getSubscriptionPlanForEdit(id);
  if (!plan) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Subscription Plan</h1>
      <SubscriptionPlanForm plan={plan} />
    </div>
  );
}
