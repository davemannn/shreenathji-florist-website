"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/config";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  deleteSubscriptionPlanIntervalIfUnused,
  findSubscriptionPlanById,
  reorderSubscriptionPlans,
  setSubscriptionPlanActive,
  updateSubscriptionPlan,
  upsertSubscriptionPlanInterval,
  type BillingInterval,
} from "@/server/repositories/subscription-plan.repository";
import {
  findCustomerSubscriptionById,
  updateCustomerSubscriptionStatus,
} from "@/server/repositories/customer-subscription.repository";
import {
  createRazorpayPlan,
  getRazorpayPublicKeyId,
  verifyRazorpaySubscriptionSignature,
} from "@/server/payments/razorpay";
import {
  startSubscription,
  cancelSubscription as cancelSubscriptionService,
} from "@/server/services/subscription.service";
import {
  cancelSubscriptionSchema,
  subscribeFormSchema,
  subscriptionPlanFormSchema,
  type CancelSubscriptionValues,
  type SubscribeFormValues,
  type SubscriptionPlanFormValues,
} from "./validations";

async function requireSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to subscribe.");
  }
  return session.user;
}

// ---------------------------------------------------------------------------
// Storefront — browse + subscribe + cancel.
// ---------------------------------------------------------------------------

export async function subscribeAction(input: SubscribeFormValues) {
  const user = await requireSessionUser();
  const values = subscribeFormSchema.parse(input);

  const { razorpaySubscriptionId } = await startSubscription({
    userId: user.id,
    userName: user.name,
    subscriptionPlanIntervalId: values.subscriptionPlanIntervalId,
    recipientName: values.recipientName,
    recipientPhone: values.recipientPhone,
    deliveryLine1: values.line1,
    deliveryLine2: values.line2,
    deliveryCity: values.city,
    deliveryState: values.state,
    deliveryPincode: values.pincode,
  });

  return { razorpaySubscriptionId, keyId: getRazorpayPublicKeyId() };
}

interface VerifySubscriptionPaymentInput {
  razorpaySubscriptionId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * Verifies the one-time authorization payment that activates recurring
 * billing — every charge after this happens server-to-server via the
 * webhook, not through this action again. Status here is set optimistically
 * to AUTHENTICATED; the webhook's subscription.activated/charged events are
 * the authoritative source once Razorpay actually processes it.
 */
export async function verifySubscriptionPaymentAction(input: VerifySubscriptionPaymentInput) {
  const user = await requireSessionUser();

  const isValid = verifyRazorpaySubscriptionSignature({
    razorpaySubscriptionId: input.razorpaySubscriptionId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
  });
  if (!isValid) {
    throw new Error("Payment verification failed. Please contact support if you were charged.");
  }

  await updateCustomerSubscriptionStatus(input.razorpaySubscriptionId, "AUTHENTICATED");

  revalidatePath("/account/subscriptions");
  return { userId: user.id };
}

export async function cancelSubscriptionAction(input: CancelSubscriptionValues) {
  const user = await requireSessionUser();
  const values = cancelSubscriptionSchema.parse(input);

  const subscription = await findCustomerSubscriptionById(values.subscriptionId, user.id);
  if (!subscription) {
    throw new Error("Subscription not found.");
  }

  await cancelSubscriptionService(subscription.razorpaySubscriptionId, values.cancelAtCycleEnd);

  revalidatePath("/account/subscriptions");
}

// ---------------------------------------------------------------------------
// Admin panel — plan catalog management + customer subscription oversight.
// ---------------------------------------------------------------------------

const INTERVAL_FIELDS = [
  {
    interval: "WEEKLY" as BillingInterval,
    enabledKey: "weeklyEnabled",
    priceKey: "weeklyPrice",
    discountKey: "weeklyDiscountPercent",
  },
  {
    interval: "MONTHLY" as BillingInterval,
    enabledKey: "monthlyEnabled",
    priceKey: "monthlyPrice",
    discountKey: "monthlyDiscountPercent",
  },
  {
    interval: "ANNUAL" as BillingInterval,
    enabledKey: "annualEnabled",
    priceKey: "annualPrice",
    discountKey: "annualDiscountPercent",
  },
] as const;

/**
 * Reconciles the form's three flattened interval fieldsets against the
 * plan's actual SubscriptionPlanInterval rows: enabled + no existing row ->
 * create (and mint a fresh Razorpay Plan); enabled + price/discount changed
 * -> mint a NEW Razorpay Plan (Plans are immutable, can't be edited in
 * place) and update the row to point at it; disabled -> delete if no
 * active subscriber still references it (silently left alone otherwise —
 * an admin can't accidentally orphan an active subscription's pricing).
 */
async function syncIntervals(planId: string, planName: string, values: SubscriptionPlanFormValues) {
  const plan = await findSubscriptionPlanById(planId);
  if (!plan) return;

  for (const field of INTERVAL_FIELDS) {
    const enabled = values[field.enabledKey];
    const price = values[field.priceKey];
    const discountPercent = values[field.discountKey];
    const existing = plan.intervals.find((i) => i.interval === field.interval);

    if (!enabled) {
      if (existing) {
        await deleteSubscriptionPlanIntervalIfUnused(existing.id);
      }
      continue;
    }

    if (!existing || existing.price !== price) {
      const razorpayPlanId = await createRazorpayPlan(field.interval, price, planName);
      await upsertSubscriptionPlanInterval(planId, field.interval, {
        price,
        discountPercent,
        razorpayPlanId,
      });
    } else if (existing.discountPercent !== discountPercent) {
      // Discount is display-only (doesn't change what Razorpay charges) —
      // safe to update without minting a new Plan.
      await upsertSubscriptionPlanInterval(planId, field.interval, {
        price,
        discountPercent,
        razorpayPlanId: existing.razorpayPlanId ?? undefined,
      });
    }
  }
}

export async function createSubscriptionPlanAction(input: SubscriptionPlanFormValues) {
  const session = await requireAdminCapability("subscriptions:manage");
  const values = subscriptionPlanFormSchema.parse(input);

  const plan = await createSubscriptionPlan({
    name: values.name,
    description: values.description,
    category: values.category,
    imageUrl: values.imageUrl || undefined,
    isActive: values.isActive,
  });

  await syncIntervals(plan.id, values.name, values);

  await logAudit(session, {
    entityType: "SubscriptionPlan",
    entityId: plan.id,
    entityLabel: values.name,
    action: "created",
    summary: "Added a subscription plan",
  });

  revalidatePath("/admin/subscriptions/plans");
  revalidatePath("/subscriptions");
  return { id: plan.id };
}

export async function updateSubscriptionPlanAction(id: string, input: SubscriptionPlanFormValues) {
  const session = await requireAdminCapability("subscriptions:manage");
  const values = subscriptionPlanFormSchema.parse(input);

  await updateSubscriptionPlan(id, {
    name: values.name,
    description: values.description,
    category: values.category,
    imageUrl: values.imageUrl || undefined,
    isActive: values.isActive,
  });

  await syncIntervals(id, values.name, values);

  await logAudit(session, {
    entityType: "SubscriptionPlan",
    entityId: id,
    entityLabel: values.name,
    action: "updated",
    summary: "Updated subscription plan details/pricing",
  });

  revalidatePath("/admin/subscriptions/plans");
  revalidatePath(`/admin/subscriptions/plans/${id}`);
  revalidatePath("/subscriptions");
}

export async function setSubscriptionPlanActiveAction(id: string, isActive: boolean) {
  const session = await requireAdminCapability("subscriptions:manage");
  const plan = await setSubscriptionPlanActive(id, isActive);

  await logAudit(session, {
    entityType: "SubscriptionPlan",
    entityId: id,
    entityLabel: plan.name,
    action: isActive ? "restored" : "archived",
    summary: isActive ? "Shown on the storefront again" : "Hidden from the storefront",
  });

  revalidatePath("/admin/subscriptions/plans");
  revalidatePath("/subscriptions");
}

export async function deleteSubscriptionPlanAction(id: string) {
  const session = await requireAdminCapability("subscriptions:manage");
  const plan = await findSubscriptionPlanById(id);
  if (!plan) return;

  try {
    await deleteSubscriptionPlan(id);
  } catch {
    throw new Error(
      "Can't delete this plan — it still has active subscribers. Deactivate it instead.",
    );
  }

  await logAudit(session, {
    entityType: "SubscriptionPlan",
    entityId: id,
    entityLabel: plan.name,
    action: "deleted",
    summary: "Permanently deleted",
  });

  revalidatePath("/admin/subscriptions/plans");
  revalidatePath("/subscriptions");
}

export async function reorderSubscriptionPlansAction(orderedIds: string[]) {
  await requireAdminCapability("subscriptions:manage");
  await reorderSubscriptionPlans(orderedIds);
  revalidatePath("/admin/subscriptions/plans");
  revalidatePath("/subscriptions");
}

export async function adminCancelSubscriptionAction(
  subscriptionId: string,
  razorpaySubscriptionId: string,
  cancelAtCycleEnd: boolean,
) {
  const session = await requireAdminCapability("subscriptions:manage");
  await cancelSubscriptionService(razorpaySubscriptionId, cancelAtCycleEnd);

  await logAudit(session, {
    entityType: "SubscriptionPlan",
    entityId: subscriptionId,
    entityLabel: razorpaySubscriptionId,
    action: "updated",
    summary: cancelAtCycleEnd
      ? "Cancelled (effective at end of current billing cycle)"
      : "Cancelled immediately",
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath(`/admin/subscriptions/${subscriptionId}`);
}
