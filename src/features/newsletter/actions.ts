"use server";

import {
  confirmNewsletterSubscriber,
  unsubscribeNewsletterSubscriber,
  upsertNewsletterSubscriber,
} from "@/server/repositories/newsletter.repository";
import { sendEmail } from "@/server/email/mailer";
import { NewsletterConfirmEmail } from "@/emails/newsletter-confirm-email";
import { getStoreSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";
import { newsletterSubscribeSchema, type NewsletterSubscribeValues } from "./validations";

export async function subscribeToNewsletterAction(input: NewsletterSubscribeValues) {
  const values = newsletterSubscribeSchema.parse(input);

  const subscriber = await upsertNewsletterSubscriber(values.email);

  try {
    const settings = await getStoreSettings();
    await sendEmail({
      to: subscriber.email,
      subject: "Confirm your subscription — Shrinathji Florist",
      react: NewsletterConfirmEmail({
        confirmUrl: `${siteConfig.url}/newsletter/confirm?token=${subscriber.confirmToken}`,
        storeAddressLine: settings.registeredAddressLine,
        storeCity: settings.registeredCity,
        storePincode: settings.registeredPincode,
      }),
    });
  } catch {
    // Genuinely fatal here, unlike other best-effort sends — a
    // confirmation email that never arrives means the subscription can
    // never actually confirm, so the customer needs to know the signup
    // didn't fully go through.
    throw new Error("Couldn't send the confirmation email. Please try again shortly.");
  }
}

export async function confirmNewsletterSubscriptionAction(token: string) {
  const subscriber = await confirmNewsletterSubscriber(token);
  return { success: !!subscriber };
}

export async function unsubscribeFromNewsletterAction(token: string) {
  const subscriber = await unsubscribeNewsletterSubscriber(token);
  return { success: !!subscriber };
}
