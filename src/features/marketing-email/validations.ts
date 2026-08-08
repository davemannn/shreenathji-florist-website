import { z } from "zod";

const AUDIENCE_KEYS = [
  "newsletter",
  "segment:VIP",
  "segment:Frequent",
  "segment:Inactive",
  "segment:New",
  "segment:Regular",
] as const;

export const composeMarketingEmailSchema = z.object({
  subject: z.string().min(3, "Enter a subject"),
  body: z.string().min(10, "Enter a message"),
  audiences: z.array(z.enum(AUDIENCE_KEYS)).min(1, "Choose at least one audience"),
});

export type ComposeMarketingEmailValues = z.infer<typeof composeMarketingEmailSchema>;
