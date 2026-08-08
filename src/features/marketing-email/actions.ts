"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import { createEmailCampaign } from "@/server/repositories/email-campaign.repository";
import { setUserMarketingOptOut } from "@/server/repositories/user.repository";
import { sendEmail } from "@/server/email/mailer";
import { MarketingEmail } from "@/emails/marketing-email";
import { getStoreSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";
import {
  signMarketingUnsubscribeToken,
  verifyMarketingUnsubscribeToken,
} from "@/lib/marketing-unsubscribe-token";
import { resolveAudience } from "./audience";
import { composeMarketingEmailSchema, type ComposeMarketingEmailValues } from "./validations";
import type { AudienceKey } from "./types";

/**
 * Delay between individual sends — Hostinger business mailboxes are
 * commonly rate-limited around 100-200/hour on shared plans (no published
 * hard number to target exactly), so this errs conservative rather than
 * firing as fast as the SMTP connection allows. At 2s/recipient, a
 * 300-recipient campaign (the size the UI starts warning past) takes
 * about 10 minutes — acceptable to hold one admin-triggered request open
 * for, since this runs on a persistent Node process (`next start`), not a
 * serverless function with its own timeout to worry about.
 */
const SEND_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Thin server-action wrapper so the client-side compose form can call the same resolver the send itself uses for its live "reaches N people" readout. */
export async function previewAudienceSizeAction(audiences: AudienceKey[]) {
  await requireAdminCapability("marketing:send");
  if (audiences.length === 0) return 0;
  const recipients = await resolveAudience(audiences);
  return recipients.length;
}

export async function sendMarketingEmailAction(input: ComposeMarketingEmailValues) {
  const session = await requireAdminCapability("marketing:send");
  const values = composeMarketingEmailSchema.parse(input);

  const recipients = await resolveAudience(values.audiences);
  if (recipients.length === 0) {
    throw new Error("No recipients match that audience.");
  }

  const settings = await getStoreSettings();
  let sent = 0;

  for (const recipient of recipients) {
    const unsubscribeUrl = recipient.userId
      ? `${siteConfig.url}/marketing/unsubscribe?uid=${recipient.userId}&token=${signMarketingUnsubscribeToken(recipient.userId)}`
      : `${siteConfig.url}/newsletter/unsubscribe?token=${recipient.newsletterUnsubscribeToken}`;

    try {
      await sendEmail({
        to: recipient.email,
        subject: values.subject,
        react: MarketingEmail({
          subject: values.subject,
          body: values.body,
          unsubscribeUrl,
          storeAddressLine: settings.registeredAddressLine,
          storeCity: settings.registeredCity,
          storePincode: settings.registeredPincode,
        }),
      });
      sent += 1;
    } catch {
      // One recipient's send failing (unconfigured mail server, a bounce,
      // whatever) shouldn't abort the rest of the campaign.
    }

    // Skip the delay after the last recipient — nothing left to throttle for.
    if (recipient !== recipients[recipients.length - 1]) {
      await sleep(SEND_DELAY_MS);
    }
  }

  await createEmailCampaign({
    subject: values.subject,
    body: values.body,
    audience: values.audiences.join(", "),
    recipientCount: sent,
    createdByUserId: session.userId,
    createdByName: session.name,
  });

  await logAudit(session, {
    entityType: "EmailCampaign",
    entityId: values.subject,
    entityLabel: values.subject,
    action: "created",
    summary: `Sent to ${sent} recipient${sent === 1 ? "" : "s"} (${values.audiences.join(", ")})`,
  });

  revalidatePath("/admin/marketing-email");

  return { sent, total: recipients.length };
}

/** No admin auth here on purpose — this is a public link clicked from an email a customer received, verified by its own signed token instead. */
export async function unsubscribeFromMarketingAction(userId: string, token: string) {
  if (!verifyMarketingUnsubscribeToken(userId, token)) {
    return { success: false };
  }
  await setUserMarketingOptOut(userId, true);
  return { success: true };
}
