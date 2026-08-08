"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  assignDeliveryPerson as assignDeliveryPersonRepo,
  findOrderByIdAdmin,
  updateOrderStatus as updateOrderStatusRepo,
} from "@/server/repositories/order.repository";
import { sendEmail } from "@/server/email/mailer";
import { OrderStatusEmail, type OrderStatusEmailStatus } from "@/emails/order-status-email";
import { getStoreSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";
import { allowedNextStatuses } from "./status-transitions";
import {
  assignDeliveryPersonSchema,
  updateOrderStatusSchema,
  type AssignDeliveryPersonValues,
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
