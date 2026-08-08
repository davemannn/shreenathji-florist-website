import { z } from "zod";
import { calculateOrderTotals } from "@/server/services/order.service";
import { apiSuccess, withApiErrors } from "@/server/api/response";

const bodySchema = z.object({
  items: z.array(
    z.object({ price: z.coerce.number().int().min(0), quantity: z.coerce.number().int().min(1) }),
  ),
  couponCode: z.string().optional(),
  deliverySlotId: z.string().optional(),
  deliveryDate: z.string().optional(),
});

/**
 * Same pricing/coupon/delivery-charge logic checkout itself uses — a
 * mobile cart screen calls this to show live totals as items/coupon/slot
 * change, without duplicating any of that logic client-side.
 */
export async function POST(request: Request) {
  return withApiErrors(async () => {
    const body = bodySchema.parse(await request.json());
    const subtotal = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const totals = await calculateOrderTotals(subtotal, {
      couponCode: body.couponCode,
      deliverySlotId: body.deliverySlotId,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
    });

    return apiSuccess(totals);
  });
}
