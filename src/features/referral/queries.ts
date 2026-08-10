import { getOrCreateReferralCode, countReferrals } from "@/server/repositories/user.repository";
import { getStoreSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";
import type { ReferralInfo } from "./types";

export async function getReferralInfo(userId: string): Promise<ReferralInfo> {
  const [code, referredCount, settings] = await Promise.all([
    getOrCreateReferralCode(userId),
    countReferrals(userId),
    getStoreSettings(),
  ]);

  return {
    code,
    referralUrl: `${siteConfig.url}/sign-up?ref=${code}`,
    referredCount,
    bonusAmount: settings.referralBonusAmount,
  };
}
