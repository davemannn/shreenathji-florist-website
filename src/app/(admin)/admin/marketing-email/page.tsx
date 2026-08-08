import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listEmailCampaignsAdmin } from "@/features/marketing-email/queries";
import { ComposeCampaignForm } from "@/features/marketing-email/components/compose-campaign-form";
import { CampaignHistoryTable } from "@/features/marketing-email/components/campaign-history-table";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Marketing Email",
};

export default async function MarketingEmailPage() {
  await requireAdminSession("marketing:send");

  const campaigns = await listEmailCampaignsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketing Email</h1>
        <p className="text-muted-foreground text-sm">
          Newsletter subscribers and customer segments only — every send includes an unsubscribe
          link.
        </p>
      </div>

      <ComposeCampaignForm />

      <Separator />

      <div>
        <h2 className="mb-3 font-semibold">Past campaigns</h2>
        <CampaignHistoryTable campaigns={campaigns} />
      </div>
    </div>
  );
}
