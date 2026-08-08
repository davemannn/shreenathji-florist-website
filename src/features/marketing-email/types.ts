import type { CustomerSegment } from "@/features/customer/segment";

export type AudienceKey = "newsletter" | `segment:${CustomerSegment}`;

export interface AdminEmailCampaign {
  id: string;
  subject: string;
  body: string;
  audience: string;
  recipientCount: number;
  createdByName: string;
  createdAt: string;
}
