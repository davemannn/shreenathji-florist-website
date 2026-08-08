import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed (not stored) unsubscribe token for segment-targeted marketing
 * emails — customers reached via a segment (not the newsletter list) have
 * no NewsletterSubscriber row of their own, so there's no token column to
 * look up. HMAC-signing the userId with the app secret means the token is
 * unguessable without needing a database table just to hold it.
 */
function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set.");
  return secret;
}

export function signMarketingUnsubscribeToken(userId: string): string {
  return createHmac("sha256", getSecret()).update(userId).digest("hex");
}

export function verifyMarketingUnsubscribeToken(userId: string, token: string): boolean {
  const expected = signMarketingUnsubscribeToken(userId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  // Constant-time compare — timingSafeEqual throws on mismatched lengths
  // rather than returning false, so guard that first.
  return a.length === b.length && timingSafeEqual(a, b);
}
