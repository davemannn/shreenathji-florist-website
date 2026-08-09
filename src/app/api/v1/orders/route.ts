import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/server/auth/config";
import { listOrdersForUser } from "@/server/repositories/order.repository";
import { placeOrderAction } from "@/features/checkout/actions";
import { apiError, apiSuccess, withApiErrors } from "@/server/api/response";

function toApiOrder(order: Awaited<ReturnType<typeof listOrdersForUser>>[number]) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    deliveryDate: order.deliveryDate.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productTitle: item.productTitle,
      variantLabel: item.variantLabel ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  };
}

/** Order history for the signed-in caller — same cookie-session auth as every other v1 route (see auth/session/route.ts's doc comment on the bearer-token gap). */
export async function GET() {
  return withApiErrors(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return apiError("You must be signed in.", 401);

    const orders = await listOrdersForUser(session.user.id);
    return apiSuccess(orders.map(toApiOrder));
  });
}

const placeOrderBodySchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      productTitle: z.string(),
      variantLabel: z.string(),
      imageUrl: z.string().optional(),
      price: z.coerce.number().int().min(0),
      quantity: z.coerce.number().int().min(1),
    }),
  ),
  recipientName: z.string().min(1),
  recipientPhone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  deliveryDate: z.string(),
  deliverySlotId: z.string().optional(),
  messageCard: z.string().optional(),
  giftWrap: z.boolean().default(false),
  couponCode: z.string().optional(),
  useWallet: z.boolean().optional(),
  paymentMethod: z.enum(["COD", "RAZORPAY"]),
  saveAddress: z.boolean().optional(),
});

/**
 * Reuses the exact same server action the web checkout form calls —
 * `placeOrderAction` already handles auth, coupon/GST/holiday validation,
 * order creation, and (for RAZORPAY) creating the gateway order. This
 * route is genuinely just an HTTP entry point onto it, not a second
 * implementation of checkout.
 */
export async function POST(request: Request) {
  return withApiErrors(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return apiError("You must be signed in.", 401);

    const body = placeOrderBodySchema.parse(await request.json());
    const result = await placeOrderAction(body);
    return apiSuccess(result, 201);
  });
}
