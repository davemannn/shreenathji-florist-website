"use server";

import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import {
  findUserByReferralCode,
  findUserById,
  setReferredBy,
} from "@/server/repositories/user.repository";
import { getReferralInfo } from "./queries";

export async function getMyReferralInfoAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in.");
  }
  return getReferralInfo(session.user.id);
}

/**
 * Called client-side right after a successful signup (see sign-up-form.tsx)
 * — no session exists to gate this on yet, since email verification has to
 * happen first (server/auth/config.ts). Authorized narrowly instead: only
 * takes effect within a few minutes of the target account's own creation,
 * and only if that account doesn't already have a referrer. That closes
 * off the obvious abuse path (assigning yourself as some existing
 * stranger's referrer to farm the reward) without needing a session for a
 * moment that, by design, doesn't have one yet. Silently no-ops on any
 * invalid input — a bad/missing referral code should never block signup.
 */
export async function applyReferralCodeAction(newUserId: string, rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  if (!code) return;

  const referrer = await findUserByReferralCode(code);
  if (!referrer || referrer.id === newUserId) return;

  const newUser = await findUserById(newUserId);
  if (!newUser) return;

  const FRESHNESS_WINDOW_MS = 10 * 60 * 1000;
  if (Date.now() - newUser.createdAt.getTime() > FRESHNESS_WINDOW_MS) return;

  await setReferredBy(newUserId, referrer.id);
}
