/**
 * One-off: run exactly once, right before/at the deploy that turns on
 * `emailAndPassword.requireEmailVerification` (see server/auth/config.ts).
 *
 * Every account created before that flag existed has `emailVerified: false`
 * by Better Auth's default — nobody has ever been through an OTP flow to
 * earn that `true`. Without this backfill, every existing customer and
 * staff account gets locked out of sign-in the moment the flag ships. This
 * grandfathers them in: they already proved control of their inbox by
 * using the site before verification existed, so re-verifying now would
 * just be a surprise, not a real security improvement.
 *
 * Usage: npx tsx scripts/backfill-email-verified.ts
 * Safe to re-run — it's a no-op for anyone already verified (via a real
 * OTP flow going forward).
 */
import "dotenv/config";
import { prisma } from "../src/server/db/prisma";

async function main() {
  const result = await prisma.user.updateMany({
    where: { emailVerified: false },
    data: { emailVerified: true },
  });

  console.log(`Marked ${result.count} existing user(s) as email-verified.`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
