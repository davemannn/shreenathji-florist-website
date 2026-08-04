import Razorpay from "razorpay";

/**
 * Server-only Razorpay client, lazily instantiated.
 *
 * Kept as a function (not a module-level singleton) so importing this file
 * never throws just because RAZORPAY_KEY_ID/SECRET aren't set yet in this
 * environment — the error only surfaces when checkout/order code actually
 * calls getRazorpayClient(). Order-creation and payment-verification logic
 * belongs in a feature-specific service (e.g. features/checkout), not here.
 */
export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
