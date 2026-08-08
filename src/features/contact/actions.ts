"use server";

import { sendEmail } from "@/server/email/mailer";
import { ContactMessageEmail } from "@/emails/contact-message-email";
import { siteConfig } from "@/config/site";
import { contactMessageSchema, type ContactMessageValues } from "./validations";

export async function sendContactMessageAction(input: ContactMessageValues) {
  const values = contactMessageSchema.parse(input);

  try {
    await sendEmail({
      to: siteConfig.contact.email,
      replyTo: values.email,
      subject: `New message from ${values.name}`,
      react: ContactMessageEmail(values),
    });
  } catch {
    throw new Error("Couldn't send your message right now. Please call or WhatsApp us instead.");
  }
}
