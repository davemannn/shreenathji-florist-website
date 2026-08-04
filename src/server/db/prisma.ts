import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Singleton PrismaClient, backed by the MariaDB driver adapter (Prisma 7's
 * standard SQL workflow — the generated client no longer talks to the
 * database directly without one).
 *
 * Next.js hot-reloads modules in dev, which would otherwise create a new
 * PrismaClient (and a new connection pool) on every edit. Caching the
 * instance on `globalThis` in non-production avoids exhausting the
 * MySQL/MariaDB connection limit during local development.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
