"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  markReminderSent,
  type CartSnapshotItem,
} from "@/server/repositories/cart-snapshot.repository";
import { prisma } from "@/server/db/prisma";
import { sendEmail } from "@/server/email/mailer";
import { AbandonedCartEmail } from "@/emails/abandoned-cart-email";
import { siteConfig } from "@/config/site";
import { formatINR } from "@/lib/format";

/**
 * Manual send, not an automated cron job — this milestone's scope is the
 * tracking + a one-click recovery action for staff, not a background
 * scheduler. `reminderSentAt` still exists so a cart already emailed isn't
 * accidentally emailed twice by a staff member re-visiting the list, and so
 * a customer who comes back and changes their cart again (which clears
 * reminderSentAt — see cart-snapshot.repository.ts) can be emailed again.
 */
export async function sendAbandonedCartRecoveryEmailAction(userId: string) {
  const session = await requireAdminCapability("customers:view");

  const snapshot = await prisma.cartSnapshot.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!snapshot || snapshot.itemCount === 0) {
    throw new Error("This cart is no longer abandoned.");
  }

  const items = snapshot.items as unknown as CartSnapshotItem[];

  try {
    await sendEmail({
      to: snapshot.user.email,
      subject: "You left something beautiful behind",
      react: AbandonedCartEmail({
        customerName: snapshot.user.name,
        items: items.map((item) => ({
          productTitle: item.productTitle,
          variantLabel: item.variantLabel,
          productSlug: item.productSlug,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: snapshot.subtotal,
        siteUrl: siteConfig.url,
      }),
    });
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message.startsWith("Email is not configured")
        ? "Email isn't configured on this server yet."
        : "Couldn't send the email — please try again.",
    );
  }

  await markReminderSent(userId);

  await logAudit(session, {
    entityType: "CartSnapshot",
    entityId: userId,
    entityLabel: snapshot.user.name,
    action: "updated",
    summary: `Sent an abandoned-cart recovery email (${snapshot.itemCount} item${snapshot.itemCount === 1 ? "" : "s"}, ${formatINR(snapshot.subtotal)})`,
  });

  revalidatePath("/admin/abandoned-carts");
}
