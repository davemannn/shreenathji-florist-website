import { prisma } from "@/server/db/prisma";

export interface CreateEmailCampaignInput {
  subject: string;
  body: string;
  audience: string;
  recipientCount: number;
  createdByUserId: string;
  createdByName: string;
}

export async function createEmailCampaign(input: CreateEmailCampaignInput) {
  return prisma.emailCampaign.create({ data: input });
}

export async function listEmailCampaigns(limit = 20) {
  return prisma.emailCampaign.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}
