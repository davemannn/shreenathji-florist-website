import crypto from "node:crypto";
import { prisma } from "./prisma";
import { MIGRATIONS } from "./migrations-data";

/**
 * Splits a migration.sql file into individual statements to run one at a
 * time. Strips `--`-comment-only lines first, then splits the remainder on
 * `;` — a real SQL parser this is not, so it only works because every
 * migration.sql in this repo happens to satisfy two things (verified
 * against all of them, not assumed): every comment is on its own line
 * (never trailing after code on the same line), and no string literal or
 * comment contains a literal `;` that would be mistaken for a statement
 * boundary if left in. A prose comment saying "...track partial refund
 * progress; OrderRefund is..." is exactly the kind of thing that broke a
 * naive whole-file split before this comment-stripping step was added —
 * ordinary punctuation in an English sentence, not SQL syntax. Any future
 * hand-written migration must keep following both rules, or add real
 * comment/string-aware parsing here instead.
 */
function splitSqlStatements(sql: string): string[] {
  const withoutComments = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  return withoutComments
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

/**
 * A minimal, self-contained re-implementation of `prisma migrate deploy`,
 * used only because the real thing has proven unreliable to invoke on
 * Hostinger: three straight deploys failed trying to spawn
 * `node_modules/.bin/prisma` (ENOENT) even after moving the `prisma`
 * package to a real dependency, and once that was worked around, a fourth
 * failed because `prisma/migrations/` itself isn't even present in
 * Hostinger's runtime environment — evidently only `.next` and a pruned
 * `node_modules` survive whatever packaging step happens between build and
 * boot there. This only depends on `@prisma/client` + `@prisma/adapter-
 * mariadb` (proven present — the app's own queries already run through
 * them) and MIGRATIONS from migrations-data.ts, an auto-generated file
 * that embeds every migration.sql's contents as plain committed TS source
 * (see that generator's own doc comment) — an ordinary `import`, so
 * Next's build-time file tracer includes it the same as any other module,
 * unlike a runtime `fs.readFileSync` it has no way to see coming.
 *
 * Deliberately narrow: applies each migration's SQL (see
 * splitSqlStatements above for exactly what that does and doesn't handle)
 * against the DB, in the embedded order, skipping ones already recorded
 * in `_prisma_migrations`. Records into the exact same `_prisma_migrations`
 * table Prisma's own CLI uses (same columns, same checksum algorithm —
 * sha256 hex of the file), so a real `prisma migrate deploy` run later
 * (once/if the CLI issue is ever resolved) sees a consistent, recognized
 * history rather than either re-applying these or flagging them as drift.
 *
 * MySQL/MariaDB DDL auto-commits per statement (no transactions to wrap
 * here) — matches how Prisma's own migrate engine already treats MySQL.
 * Guarded by a session-level advisory lock (GET_LOCK) so two Node
 * processes booting at once (this app's prod server runs a router +
 * worker process — see prisma.ts's own comment) can't apply the same
 * migration concurrently.
 */
export async function runPendingMigrations(): Promise<void> {
  const LOCK_NAME = "shrinathji_migrate_deploy";
  const [{ acquired } = { acquired: 0 }] = await prisma.$queryRawUnsafe<{ acquired: number }[]>(
    `SELECT GET_LOCK(?, 30) AS acquired`,
    LOCK_NAME,
  );
  if (!acquired) {
    console.error(
      "[migrate] couldn't acquire migration lock within 30s — another process may be applying migrations; skipping this run.",
    );
    return;
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`_prisma_migrations\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`checksum\` VARCHAR(64) NOT NULL,
        \`finished_at\` DATETIME(3) NULL,
        \`migration_name\` VARCHAR(255) NOT NULL,
        \`logs\` TEXT NULL,
        \`rolled_back_at\` DATETIME(3) NULL,
        \`started_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`applied_steps_count\` INT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    const appliedRows = await prisma.$queryRawUnsafe<{ migration_name: string }[]>(
      "SELECT migration_name FROM `_prisma_migrations` WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL",
    );
    const applied = new Set(appliedRows.map((row) => row.migration_name));

    const pending = MIGRATIONS.filter((migration) => !applied.has(migration.name));
    if (pending.length === 0) {
      console.log("[migrate] up to date — no pending migrations.");
      return;
    }
    console.log(
      `[migrate] ${pending.length} pending migration(s):`,
      pending.map((m) => m.name).join(", "),
    );

    for (const { name, sql } of pending) {
      const checksum = crypto.createHash("sha256").update(sql).digest("hex");
      const id = crypto.randomUUID();
      const statements = splitSqlStatements(sql);

      await prisma.$executeRawUnsafe(
        "INSERT INTO `_prisma_migrations` (id, checksum, migration_name, started_at, applied_steps_count) VALUES (?, ?, ?, NOW(3), 0)",
        id,
        checksum,
        name,
      );

      console.log(`[migrate] applying ${name} (${statements.length} statement(s))...`);
      try {
        for (const statement of statements) {
          await prisma.$executeRawUnsafe(statement);
        }
      } catch (error) {
        // Left as a permanently-unfinished row (finished_at stays NULL) —
        // matches how a real `prisma migrate deploy` leaves a failed
        // migration for a human to look at, rather than silently marking
        // it done. Stop here; later migrations may depend on this one.
        console.error(`[migrate] "${name}" failed partway through:`, error);
        throw error;
      }

      await prisma.$executeRawUnsafe(
        "UPDATE `_prisma_migrations` SET finished_at = NOW(3), applied_steps_count = ? WHERE id = ?",
        statements.length,
        id,
      );
      console.log(`[migrate] applied ${name}`);
    }

    console.log("[migrate] all pending migrations applied.");
  } finally {
    await prisma.$queryRawUnsafe("SELECT RELEASE_LOCK(?)", LOCK_NAME).catch(() => {});
  }
}
