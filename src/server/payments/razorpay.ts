import { createHmac } from "crypto";
import Razorpay from "razorpay";

/**
 * Server-only Razorpay client, lazily instantiated.
 *
 * Kept as a function (not a module-level singleton) so importing this file
 * never throws just because RAZORPAY_KEY_ID/SECRET aren't set yet in this
 * environment — the error only surfaces when checkout code actually calls
 * getRazorpayClient().
 */
export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** Creates a Razorpay order. `amountInRupees` is converted to paise here — the one place that conversion happens. */
export async function createRazorpayOrder(amountInRupees: number, receipt: string) {
  const client = getRazorpayClient();
  return client.orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
  });
}

/** The public key id the client-side Checkout.js widget needs — safe to send to the browser (unlike the secret). */
export function getRazorpayPublicKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Razorpay is not configured: set RAZORPAY_KEY_ID.");
  }
  return keyId;
}

interface VerifyRazorpaySignatureParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/** Per Razorpay's documented verification scheme: HMAC-SHA256 of "order_id|payment_id" using the key secret. */
export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: VerifyRazorpaySignatureParams): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay is not configured: set RAZORPAY_KEY_SECRET.");
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expectedSignature === razorpaySignature;
}
