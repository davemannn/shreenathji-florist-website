interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayPaymentResponse) => void;
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

interface OpenRazorpayCheckoutParams {
  keyId: string;
  amount: number;
  razorpayOrderId: string;
  recipientName: string;
  recipientPhone: string;
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onDismiss: () => void;
}

/** Lazy-loads checkout.js (only when a Razorpay payment is actually attempted, not on every checkout page load) and opens the widget. */
export async function openRazorpayCheckout(params: OpenRazorpayCheckoutParams) {
  await loadRazorpayScript();

  const razorpay = new window.Razorpay({
    key: params.keyId,
    amount: params.amount,
    currency: "INR",
    order_id: params.razorpayOrderId,
    name: "Shreenathji Florist",
    description: "Order payment",
    prefill: { name: params.recipientName, contact: params.recipientPhone },
    theme: { color: "#c9105f" },
    handler: params.onSuccess,
    modal: { ondismiss: params.onDismiss },
  });

  razorpay.open();
}
