import { Resend } from "resend";

/**
 * Server-only Resend client, lazily instantiated.
 *
 * Transactional email (order confirmations, admin new-order alerts, contact
 * form submissions) is sent through this client. Actual email templates
 * live in src/emails/ (react-email components) and are composed by
 * feature-specific services, not here.
 */
export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Resend is not configured: set RESEND_API_KEY.");
  }

  return new Resend(apiKey);
}
