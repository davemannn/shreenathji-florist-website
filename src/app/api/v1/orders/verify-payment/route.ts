import { z } from "zod";
import { verifyRazorpayPaymentAction } from "@/features/checkout/actions";
import { apiSuccess, withApiErrors } from "@/server/api/response";

const bodySchema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

/** Thin wrapper over the same action the web checkout's Razorpay success handler calls. */
export async function POST(request: Request) {
  return withApiErrors(async () => {
    const body = bodySchema.parse(await request.json());
    const result = await verifyRazorpayPaymentAction(body);
    return apiSuccess(result);
  });
}
