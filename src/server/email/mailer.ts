import nodemailer, { type Transporter } from "nodemailer";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

/**
 * Server-only Hostinger SMTP transport, lazily instantiated — same
 * lazy-singleton shape the old Resend client used, so callers don't need
 * to change how they think about this.
 *
 * Transactional and marketing email alike goes through this one function.
 * Actual email templates live in src/emails/ (react-email components) and
 * are composed by feature-specific actions, not here — this module only
 * knows how to turn a rendered template into a sent message.
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("Email is not configured: set SMTP_USER and SMTP_PASS.");
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
      port,
      // Port 465 is implicit-TLS; 587 (and anything else) is STARTTLS —
      // nodemailer's `secure` flag picks which handshake to use, it isn't
      // just "on/off encryption".
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
}

/** Reused by every template's "from" address unless a call site overrides it. */
export const DEFAULT_FROM =
  process.env.EMAIL_FROM ?? "Shrinathji Florist <support@shrinathjiflorist.com>";

/** The store's own inbox — where admin alert emails (new-order, etc.) land, as opposed to DEFAULT_FROM which is what customers see mail arrive *from*. Same mailbox in practice, just the bare address instead of the "Name <addr>" form. */
export const STORE_INBOX = process.env.SMTP_USER ?? "support@shrinathjiflorist.com";

export interface SendEmailInput {
  to: string;
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
}

/**
 * Renders a react-email component to HTML and sends it via the Hostinger
 * SMTP transport. Resend's SDK used to do the JSX→HTML rendering
 * internally (`resend.emails.send({ react })`); nodemailer has no such
 * capability, so that step happens explicitly here instead — every other
 * call site is otherwise unchanged from the Resend-era shape.
 */
export async function sendEmail({ to, subject, react, from, replyTo }: SendEmailInput) {
  const html = await render(react);

  try {
    await getTransporter().sendMail({ from: from ?? DEFAULT_FROM, to, subject, html, replyTo });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Email is not configured")) {
      throw error;
    }
    throw new Error("Couldn't send the email — the mail server rejected the request.");
  }
}
