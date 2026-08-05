"use server";

import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import {
  attachRazorpayOrderId,
  createGiftCard,
  findGiftCardById,
  markGiftCardPaid,
} from "@/server/repositories/gift-card.repository";
import {
  createRazorpayOrder,
  getRazorpayPublicKeyId,
  verifyRazorpaySignature,
} from "@/server/payments/razorpay";
import { getResendClient } from "@/server/email/resend";
import { GiftCardEmail } from "@/emails/gift-card-email";
import { giftCardSchema, type GiftCardValues } from "./validations";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to purchase a gift card.");
  }
  return session.user;
}

/** `GC-XXXXXXXX` — simple and readable enough to read aloud over a phone call. */
function generateGiftCardCode(): string {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `GC-${random}`;
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
    const resend = getResendClient();
    const isForSelf = giftCard.recipientType === "SELF";
    await resend.emails.send({
      from: "Shreenathji Florist <onboarding@resend.dev>",
      to: isForSelf ? user.email : (giftCard.recipientEmail ?? user.email),
      subject: isForSelf
        ? "Your Shreenathji Florist gift card"
        : `${user.name} sent you a gift card!`,
      react: GiftCardEmail({
        code: giftCard.code,
        amount: giftCard.amount,
        purchaserName: user.name,
        recipientName: giftCard.recipientName ?? undefined,
        message: giftCard.message ?? undefined,
        isForSelf,
      }),
    });
  } catch {
    // Resend not configured, or the send failed — not fatal to the purchase.
  }

  return { code: giftCard.code };
}
