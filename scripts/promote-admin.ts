/**
 * Promotes an existing user (already signed up through /sign-up, so their
 * password is correctly hashed by Better Auth) to the "admin" role.
 *
 * Usage: npx tsx scripts/promote-admin.ts you@example.com
 */
import "dotenv/config";
import { prisma } from "../src/server/db/prisma";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`Promoted ${user.email} to admin.`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
