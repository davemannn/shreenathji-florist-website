import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Singleton PrismaClient, backed by the MariaDB driver adapter (Prisma 7's
 * standard SQL workflow — the generated client no longer talks to the
 * database directly without one).
 *
 * Next.js hot-reloads modules in dev, which would otherwise create a new
 * PrismaClient (and a new connection pool) on every edit — caching on
 * `globalThis` avoids that. Cached in every environment, not just dev:
 * the "only cache outside production" pattern seen in a lot of Prisma
 * examples assumes a serverless deploy target where each invocation gets
 * a fresh module scope anyway (so caching there is a no-op, not a
 * requirement). On a persistent long-running `next start` process — which
 * is what this actually runs as — skipping the cache in production would
 * mean any re-evaluation of this module creates a whole new client and
 * connection pool without anything telling us.
 *
 * connectionLimit is set explicitly (small) rather than left at the
 * mariadb driver's default of 10 — Next.js's production server runs a
 * router process plus a separate worker process, each importing this
 * module independently, so the *effective* default would be up to 10
 * connections per process, not per app. On shared hosting with a low
 * concurrent-connection cap (e.g. Hostinger's MySQL), that's enough to
 * exhaust the limit and make every connection past the first hang instead
 * of erroring, which is exactly the failure mode this was tuned to fix.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  try {
    const parsed = new URL(databaseUrl);
    const adapter = new PrismaMariaDb({
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
      connectionLimit: 3,
      acquireTimeout: 10000,
    });
    return new PrismaClient({ adapter });
  } catch {
    // DATABASE_URL missing/invalid at import time (e.g. a build step that
    // never actually queries the DB) — fall back to the driver's own lazy
    // string handling so merely importing this module never crashes the
    // build. Real query attempts will still fail with a clear error later.
    const adapter = new PrismaMariaDb(databaseUrl);
    return new PrismaClient({ adapter });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
