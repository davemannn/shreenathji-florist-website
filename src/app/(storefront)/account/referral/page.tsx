import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { getReferralInfo } from "@/features/referral/queries";
import { ReferralCard } from "@/features/referral/components/referral-card";

export const metadata: Metadata = {
  title: "Refer a Friend",
};

export default async function AccountReferralPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in?redirectTo=/account/referral");
  }

  const info = await getReferralInfo(session.user.id);

  return <ReferralCard info={info} />;
}
