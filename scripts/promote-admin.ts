/**
 * Promotes an existing user (already signed up through /sign-up, so their
 * password is correctly hashed by Better Auth) to a staff role.
 *
 * Usage: npx tsx scripts/promote-admin.ts you@example.com [role]
 *   role defaults to "super_admin" — one of: super_admin, admin, store_manager, delivery_guy
 */
import "dotenv/config";
import { prisma } from "../src/server/db/prisma";
import { ADMIN_ROLES, type AdminRole } from "../src/server/auth/permissions";

async function main() {
  const email = process.argv[2];
  const roleArg = process.argv[3] ?? "super_admin";

  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email> [role]");
    console.error(`Roles: ${ADMIN_ROLES.join(", ")} (default: super_admin)`);
    process.exit(1);
  }

  if (!(ADMIN_ROLES as readonly string[]).includes(roleArg)) {
    console.error(`Invalid role "${roleArg}". Must be one of: ${ADMIN_ROLES.join(", ")}`);
    process.exit(1);
  }

  const role = roleArg as AdminRole;

  const user = await prisma.user.update({
    where: { email },
    data: { role },
  });

  console.log(`Promoted ${user.email} to ${role}.`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
