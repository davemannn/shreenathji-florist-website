"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/config";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  attachRazorpayOrderId,
  adjustGiftCardBalance as adjustGiftCardBalanceRepo,
  createGiftCard,
  findGiftCardById,
  issueGiftCard as issueGiftCardRepo,
  markGiftCardPaid,
  redeemGiftCardByCode,
} from "@/server/repositories/gift-card.repository";
import { findUserByEmail } from "@/server/repositories/user.repository";
import {
  createRazorpayOrder,
  getRazorpayPublicKeyId,
  verifyRazorpaySignature,
} from "@/server/payments/razorpay";
import { sendEmail } from "@/server/email/mailer";
import { GiftCardEmail } from "@/emails/gift-card-email";
import { siteConfig } from "@/config/site";
import {
  adjustGiftCardBalanceFormSchema,
  giftCardSchema,
  issueGiftCardFormSchema,
  redeemGiftCardSchema,
  type AdjustGiftCardBalanceFormValues,
  type GiftCardValues,
  type IssueGiftCardFormValues,
  type RedeemGiftCardValues,
} from "./validations";
import { generateGiftCardCode } from "./generate-code";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to purchase a gift card.");
  }
  return session.user;
}

export async function purchaseGiftCardAction(input: GiftCardValues) {
  const user = await requireUser();
  const values = giftCardSchema.parse(input);
  const isForOther = values.recipientType === "OTHER";

  const giftCard = await createGiftCard({
    code: generateGiftCardCode(),
    amount: values.amount,
    purchaserId: user.id,
    recipientType: values.recipientType,
    recipientName: isForOther ? values.recipientName : undefined,
    recipientEmail: isForOther ? values.recipientEmail : undefined,
    recipientPhone: isForOther && values.recipientPhone ? values.recipientPhone : undefined,
    message: values.message,
    deliveryDate: new Date(values.deliveryDate),
  });

  const razorpayOrder = await createRazorpayOrder(giftCard.amount, giftCard.code);
  await attachRazorpayOrderId(giftCard.id, razorpayOrder.id);

  return {
    giftCardId: giftCard.id,
    code: giftCard.code,
    razorpay: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      keyId: getRazorpayPublicKeyId(),
    },
  };
}

interface VerifyGiftCardPaymentInput {
  giftCardId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function verifyGiftCardPaymentAction(input: VerifyGiftCardPaymentInput) {
  const user = await requireUser();

  // Scoped lookup — never mark payment state on a gift card without
  // confirming it actually belongs to the caller first.
  const giftCard = await findGiftCardById(input.giftCardId, user.id);
  if (!giftCard) {
    throw new Error("Gift card not found.");
  }

  const isValid = verifyRazorpaySignature({
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
  });

  if (!isValid) {
    throw new Error("Payment verification failed. Please contact support if you were charged.");
  }

  await markGiftCardPaid(giftCard.id, input.razorpayPaymentId);

  // Best-effort — the purchase itself already succeeded, so a failed/
  // unconfigured email send shouldn't surface as an error to the buyer.
  try {
    const isForSelf = giftCard.recipientType === "SELF";
    await sendEmail({
      to: isForSelf ? user.email : (giftCard.recipientEmail ?? user.email),
      subject: isForSelf
        ? "Your Shrinathji Florist gift card"
        : `${user.name} sent you a gift card!`,
      react: GiftCardEmail({
        code: giftCard.code,
        amount: giftCard.amount,
        purchaserName: user.name,
        recipientName: giftCard.recipientName ?? undefined,
        message: giftCard.message ?? undefined,
        isForSelf,
        redeemUrl: `${siteConfig.url}/account`,
      }),
    });
  } catch {
    // Email isn't configured, or the send failed — not fatal to the purchase.
  }

  return { code: giftCard.code };
}

/**
 * Self-service redemption — signed-in user pastes in a gift card code and
 * its value moves into their own wallet. This is the only path a gifted
 * (OTHER-recipient) card's value ever reaches a spendable balance; a
 * SELF-purchase is auto-redeemed on payment instead (see
 * verifyGiftCardPaymentAction above) but hitting this action for one too
 * is harmless — redeemGiftCardByCode just reports it's already redeemed.
 */
export async function redeemGiftCardAction(input: RedeemGiftCardValues) {
  const user = await requireUser();
  const values = redeemGiftCardSchema.parse(input);

  const card = await redeemGiftCardByCode(values.code, user.id);

  revalidatePath("/account");
  revalidatePath("/checkout");
  return { amount: card.creditedAmount };
}

// ---------------------------------------------------------------------------
// Admin panel — marketing/content management (Phase 4). Both actions require
// gift_cards:issue, which only super_admin has (see permissions.ts) — this is
// spendable balance created or changed with no real payment behind it.
// ---------------------------------------------------------------------------

export async function issueGiftCardAction(input: IssueGiftCardFormValues) {
  const session = await requireAdminCapability("gift_cards:issue");
  const values = issueGiftCardFormSchema.parse(input);

  const purchaser = await findUserByEmail(values.purchaserEmail);
  if (!purchaser) {
    throw new Error("No account found with that email — the customer needs to sign up first.");
  }

  const isForOther = values.recipientType === "OTHER";
  const card = await issueGiftCardRepo({
    code: generateGiftCardCode(),
    amount: values.amount,
    purchaserId: purchaser.id,
    recipientType: values.recipientType,
    recipientName: isForOther ? values.recipientName : undefined,
    recipientEmail: isForOther ? values.recipientEmail : undefined,
    recipientPhone: isForOther ? values.recipientPhone : undefined,
    message: values.message,
    reason: values.reason,
    issuedByUserId: session.userId,
  });

  await logAudit(session, {
    entityType: "GiftCard",
    entityId: card.id,
    entityLabel: card.code,
    action: "created",
    summary: `Manually issued ₹${values.amount} — ${values.reason}`,
  });

  revalidatePath("/admin/gift-cards");
  return { id: card.id, code: card.code };
}

export async function adjustGiftCardBalanceAction(
  giftCardId: string,
  input: AdjustGiftCardBalanceFormValues,
) {
  const session = await requireAdminCapability("gift_cards:issue");
  const values = adjustGiftCardBalanceFormSchema.parse(input);

  const card = await adjustGiftCardBalanceRepo(
    giftCardId,
    values.amount,
    values.reason,
    session.userId,
  );

  await logAudit(session, {
    entityType: "GiftCard",
    entityId: giftCardId,
    entityLabel: card.code,
    action: "updated",
    summary: `${values.amount >= 0 ? "Credited" : "Debited"} ₹${Math.abs(values.amount)} — ${values.reason}`,
  });

  revalidatePath("/admin/gift-cards");
  revalidatePath(`/admin/gift-cards/${giftCardId}`);
}
