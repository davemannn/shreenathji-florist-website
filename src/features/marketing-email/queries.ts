import { listEmailCampaigns as listEmailCampaignsRepo } from "@/server/repositories/email-campaign.repository";
import type { AdminEmailCampaign } from "./types";

export async function listEmailCampaignsAdmin(): Promise<AdminEmailCampaign[]> {
  const campaigns = await listEmailCampaignsRepo();
  return campaigns.map((c) => ({
    id: c.id,
    subject: c.subject,
    body: c.body,
    audience: c.audience,
    recipientCount: c.recipientCount,
    createdByName: c.createdByName,
    createdAt: c.createdAt.toISOString(),
  }));
}
