import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import { findOrderByNumber } from "@/server/repositories/order.repository";
import { apiError, apiSuccess, withApiErrors } from "@/server/api/response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  return withApiErrors(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return apiError("You must be signed in.", 401);

    const { orderNumber } = await params;
    // Scoped by userId inside the repository call itself — never trust a
    // client-supplied order number alone to return someone else's order.
    const order = await findOrderByNumber(orderNumber, session.user.id);
    if (!order) return apiError("Order not found.", 404);

    return apiSuccess({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      discount: order.discount,
      deliveryCharge: order.deliveryCharge,
      total: order.total,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      deliveryLine1: order.deliveryLine1,
      deliveryLine2: order.deliveryLine2 ?? undefined,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      deliveryPincode: order.deliveryPincode,
      deliveryDate: order.deliveryDate.toISOString(),
      deliverySlot: order.deliverySlot
        ? {
            id: order.deliverySlot.id,
            label: order.deliverySlot.label,
            type: order.deliverySlot.type,
          }
        : null,
      messageCard: order.messageCard ?? undefined,
      giftWrap: order.giftWrap,
      couponCode: order.coupon?.code,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId ?? undefined,
        variantId: item.variantId ?? undefined,
        productTitle: item.productTitle,
        variantLabel: item.variantLabel ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
    });
  });
}
