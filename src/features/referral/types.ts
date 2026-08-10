export interface ReferralInfo {
  code: string;
  /** Full shareable link — /sign-up?ref=<code>. */
  referralUrl: string;
  /** How many people have signed up under this code so far (regardless of whether the reward has paid out for each yet). */
  referredCount: number;
  /** ₹ credited to both sides when a referred friend's first order confirms — 0 means the program is effectively off (see StoreSettings.referralBonusAmount). */
  bonusAmount: number;
}
