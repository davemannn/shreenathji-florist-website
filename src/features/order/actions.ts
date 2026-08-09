"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  assignDeliveryPerson as assignDeliveryPersonRepo,
  findOrderByIdAdmin,
  recordOrderRefund,
  updateOrderStatus as updateOrderStatusRepo,
} from "@/server/repositories/order.repository";
import { refundRazorpayPayment } from "@/server/payments/razorpay";
import { sendEmail } from "@/server/email/mailer";
import { OrderStatusEmail, type OrderStatusEmailStatus } from "@/emails/order-status-email";
import { OrderRefundEmail } from "@/emails/order-refund-email";
import { getStoreSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";
import { allowedNextStatuses } from "./status-transitions";
import {
  assignDeliveryPersonSchema,
  processRefundSchema,
  updateOrderStatusSchema,
  type AssignDeliveryPersonValues,
  type ProcessRefundValues,
  type UpdateOrderStatusValues,
} from "./validations";

const EMAILED_STATUSES: OrderStatusEmailStatus[] = ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

/**
 * Only fires for the three transitions above — PROCESSING is an internal
 * housekeeping status, not something a customer needs an email about.
 * Non-fatal: a failed notification shouldn't block the status update
 * itself, matching every other best-effort email send in this codebase.
 */
async function sendOrderStatusEmailIfNeeded(
  order: NonNullable<Awaited<ReturnType<typeof findOrderByIdAdmin>>>,
  toStatus: string,
) {
  if (!EMAILED_STATUSES.includes(toStatus as OrderStatusEmailStatus)) return;

  try {
    const settings = await getStoreSettings();
    await sendEmail({
      to: order.user.email,
      subject: `Order ${order.orderNumber} — ${toStatus === "OUT_FOR_DELIVERY" ? "out for delivery" : toStatus === "DELIVERED" ? "delivered" : "cancelled"}`,
      react: OrderStatusEmail({
        customerName: order.user.name,
        orderNumber: order.orderNumber,
        status: toStatus as OrderStatusEmailStatus,
        trackOrderUrl: `${siteConfig.url}/account/orders`,
        storeAddressLine: settings.registeredAddressLine,
        storeCity: settings.registeredCity,
        storePincode: settings.registeredPincode,
      }),
    });
  } catch {
    // Email isn't configured, or the send failed — not fatal to the status update.
  }
}

export async function updateOrderStatusAction(input: UpdateOrderStatusValues) {
  const values = updateOrderStatusSchema.parse(input);
  // orders:update_status:any covers staff; :assigned covers delivery_guy —
  // either is enough to get past the door, the *specific* transition is
  // checked below against the real current status and, for delivery_guy,
  // whether the order is actually assigned to them.
  const session = await requireAdminCapability([
    "orders:update_status:any",
    "orders:update_status:assigned",
  ]);

  const order = await findOrderByIdAdmin(values.orderId);
  if (!order) throw new Error("Order not found.");

  if (session.role === "delivery_guy" && order.assignedDeliveryPersonId !== session.userId) {
    throw new Error("This order isn't assigned to you.");
  }

  const allowed = allowedNextStatuses(session.role, order.status);
  if (!allowed.includes(values.toStatus)) {
    throw new Error(`Can't move this order from ${order.status} to ${values.toStatus}.`);
  }

  await updateOrderStatusRepo({
    orderId: values.orderId,
    toStatus: values.toStatus,
    changedByUserId: session.userId,
    changedByName: session.name,
    changedByRole: session.role,
    note: values.note,
  });
  await sendOrderStatusEmailIfNeeded(order, values.toStatus);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${values.orderId}`);
  revalidatePath("/admin/my-deliveries");
}

export async function assignDeliveryPersonAction(input: AssignDeliveryPersonValues) {
  const values = assignDeliveryPersonSchema.parse(input);
  await requireAdminCapability("orders:assign_delivery");

  await assignDeliveryPersonRepo(values.orderId, values.deliveryPersonId);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${values.orderId}`);
  revalidatePath("/admin/my-deliveries");
}

/**
 * Refunds (all or part of) a cancelled, Razorpay-paid order — restricted to
 * super_admin/admin (see orders:refund in permissions.ts), a narrower tier
 * than plain orders:cancel since this actually moves real money out via
 * Razorpay's API. Only usable once the order is already CANCELLED — refund
 * is a separate, deliberate step after cancellation, not automatic.
 */
export async function processRefundAction(input: ProcessRefundValues) {
  const values = processRefundSchema.parse(input);
  const session = await requireAdminCapability("orders:refund");

  const order = await findOrderByIdAdmin(values.orderId);
  if (!order) throw new Error("Order not found.");

  if (order.status !== "CANCELLED") {
    throw new Error("Cancel this order first, then process the refund.");
  }
  if (order.paymentMethod !== "RAZORPAY") {
    throw new Error("Only Razorpay-paid orders can be refunded here.");
  }
  if (!order.razorpayPaymentId) {
    throw new Error("This order has no Razorpay payment on record.");
  }

  // The gateway-charged amount excludes any wallet portion — that's
  // already restored to the customer's wallet automatically on cancel
  // (see order.repository.ts's updateOrderStatus), so it's never part of
  // what's refundable here.
  const chargedAmount = order.total - order.walletAmountUsed;
  const maxRefundable = chargedAmount - order.refundedAmount;
  if (maxRefundable <= 0) {
    throw new Error("This order has already been fully refunded.");
  }
  if (values.amount > maxRefundable) {
    throw new Error(`Amount exceeds what's left to refund (₹${maxRefundable}).`);
  }

  const refund = await refundRazorpayPayment(order.razorpayPaymentId, values.amount, {
    orderNumber: order.orderNumber,
    reason: values.reason ?? "",
  });

  const updatedOrder = await recordOrderRefund({
    orderId: values.orderId,
    amount: values.amount,
    razorpayRefundId: refund.razorpayRefundId,
    razorpayStatus: refund.status,
    reason: values.reason,
    processedByUserId: session.userId,
  });

  try {
    const settings = await getStoreSettings();
    await sendEmail({
      to: order.user.email,
      subject: `Refund processed for order ${order.orderNumber}`,
      react: OrderRefundEmail({
        customerName: order.user.name,
        orderNumber: order.orderNumber,
        amount: values.amount,
        isFullRefund: updatedOrder.paymentStatus === "REFUNDED",
        trackOrderUrl: `${siteConfig.url}/account/orders`,
        storeAddressLine: settings.registeredAddressLine,
        storeCity: settings.registeredCity,
        storePincode: settings.registeredPincode,
      }),
    });
  } catch {
    // Email isn't configured, or the send failed — the refund itself already succeeded.
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${values.orderId}`);
  revalidatePath("/account/orders");
  revalidatePath(`/invoice/${order.orderNumber}`);
}
