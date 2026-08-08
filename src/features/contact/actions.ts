"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  createContactMessage,
  deleteContactMessage,
  setContactMessageRead,
} from "@/server/repositories/contact-message.repository";
import { sendEmail } from "@/server/email/mailer";
import { ContactMessageEmail } from "@/emails/contact-message-email";
import { siteConfig } from "@/config/site";
import { contactMessageSchema, type ContactMessageValues } from "./validations";

/**
 * Stores the submission first (the record of record — previously this only
 * ever sent an email with no DB storage and no admin visibility, so a lost/
 * filtered email meant a lost inquiry) then best-effort emails the store
 * inbox as an immediate notification. The email failing doesn't fail the
 * submission — the message is already safely saved either way.
 */
export async function sendContactMessageAction(input: ContactMessageValues) {
  const values = contactMessageSchema.parse(input);

  await createContactMessage(values);

  try {
    await sendEmail({
      to: siteConfig.contact.email,
      replyTo: values.email,
      subject: `New message from ${values.name}`,
      react: ContactMessageEmail(values),
    });
  } catch {
    // Email isn't configured, or the send failed — not fatal, the message
    // is already stored and visible in the admin panel either way.
  }
}

export async function setContactMessageReadAction(id: string, isRead: boolean) {
  await requireAdminCapability("customers:view");
  await setContactMessageRead(id, isRead);
  revalidatePath("/admin/contact-messages");
}

export async function deleteContactMessageAction(id: string) {
  await requireAdminCapability("customers:view");
  await deleteContactMessage(id);
  revalidatePath("/admin/contact-messages");
}
