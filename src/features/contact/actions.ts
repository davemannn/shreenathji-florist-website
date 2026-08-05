"use server";

import { getResendClient } from "@/server/email/resend";
import { ContactMessageEmail } from "@/emails/contact-message-email";
import { siteConfig } from "@/config/site";
import { contactMessageSchema, type ContactMessageValues } from "./validations";

export async function sendContactMessageAction(input: ContactMessageValues) {
  const values = contactMessageSchema.parse(input);

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: "Shreenathji Florist Website <onboarding@resend.dev>",
    to: siteConfig.contact.email,
    replyTo: values.email,
    subject: `New message from ${values.name}`,
    react: ContactMessageEmail(values),
  });

  if (error) {
    throw new Error("Couldn't send your message right now. Please call or WhatsApp us instead.");
  }
}
