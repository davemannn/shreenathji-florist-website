// Client-side Razorpay Checkout.js loader/opener — shared by any feature
// that takes an online payment (checkout, gift cards, subscriptions).
// Lazy-loads the script only when a payment is actually attempted, not on
// every page load.

/** Raw shape the widget's handler actually receives — which fields are present depends on order_id vs. subscription_id mode, so both are optional here; each exported function below narrows to what its own mode guarantees. */
interface RazorpayRawResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount?: number;
  currency?: string;
  order_id?: string;
  subscription_id?: string;
  name: string;
  description?: string;
  prefill?: { name?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayRawResponse) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Couldn't load Razorpay checkout. Check your connection."));
    document.body.appendChild(script);
  });
}

interface RazorpayOrderPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface OpenRazorpayCheckoutParams {
  keyId: string;
  amount: number;
  razorpayOrderId: string;
  description?: string;
  recipientName: string;
  recipientPhone: string;
  onSuccess: (response: RazorpayOrderPaymentResponse) => void;
  onDismiss: () => void;
}

/** Lazy-loads checkout.js (only when a Razorpay payment is actually attempted, not on every page load) and opens the widget. */
export async function openRazorpayCheckout(params: OpenRazorpayCheckoutParams) {
  await loadRazorpayScript();

  const razorpay = new window.Razorpay({
    key: params.keyId,
    amount: params.amount,
    currency: "INR",
    order_id: params.razorpayOrderId,
    name: "Shrinathji Florist",
    description: params.description ?? "Order payment",
    prefill: { name: params.recipientName, contact: params.recipientPhone },
    theme: { color: "#c9105f" },
    // order_id mode always returns razorpay_order_id — safe to assert down
    // to the narrower, guaranteed-present shape callers actually want.
    handler: (response) => params.onSuccess(response as RazorpayOrderPaymentResponse),
    modal: { ondismiss: params.onDismiss },
  });

  razorpay.open();
}

interface RazorpaySubscriptionPaymentResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface OpenRazorpaySubscriptionCheckoutParams {
  keyId: string;
  razorpaySubscriptionId: string;
  description?: string;
  recipientName: string;
  recipientPhone: string;
  onSuccess: (response: RazorpaySubscriptionPaymentResponse) => void;
  onDismiss: () => void;
}

/**
 * Subscription-mode checkout — `subscription_id` instead of `order_id`,
 * with `amount`/`currency` omitted entirely (Razorpay determines both from
 * the Plan tied to the subscription, not the checkout call). This is the
 * one-time "authorize recurring billing" payment; every charge after this
 * happens server-to-server, with no further checkout involved — see
 * app/api/webhooks/razorpay/route.ts.
 */
export async function openRazorpaySubscriptionCheckout(
  params: OpenRazorpaySubscriptionCheckoutParams,
) {
  await loadRazorpayScript();

  const razorpay = new window.Razorpay({
    key: params.keyId,
    subscription_id: params.razorpaySubscriptionId,
    name: "Shrinathji Florist",
    description: params.description ?? "Subscription authorization",
    prefill: { name: params.recipientName, contact: params.recipientPhone },
    theme: { color: "#c9105f" },
    handler: (response) => params.onSuccess(response as RazorpaySubscriptionPaymentResponse),
    modal: { ondismiss: params.onDismiss },
  });

  razorpay.open();
}
