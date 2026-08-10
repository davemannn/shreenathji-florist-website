/**
 * Runs as `prebuild` (npm auto-runs this before `npm run build`) — see
 * package.json. This is the actual fix for a whole class of failure that
 * `export const dynamic = "force-dynamic"` was only ever patching one page
 * at a time: `next build`'s static generation queries the database (e.g.
 * every storefront page renders <SiteHeader>, which reads the full
 * Category table for nav — see components/shared/site-header.tsx), and
 * that happens BEFORE this app's boot-time migration step
 * (instrumentation-node.ts) ever runs, since build always precedes boot.
 * A build landing between two deploys — after new columns were added to
 * the schema but before this specific build's own boot has applied
 * them — sees a database that's one migration behind, and any static page
 * touching the changed table fails outright with a "column does not
 * exist" Prisma error instead of quietly serving stale data.
 *
 * Running the same migration runner here, ahead of the build, means
 * `next build` always sees the current deploy's actual schema. The
 * boot-time run in instrumentation-node.ts stays too — cheap/idempotent
 * once nothing's pending, and a safety net for restarts that don't go
 * through a fresh build.
 */
import "dotenv/config";
import { runPendingMigrations } from "../src/server/db/migrate";
import { prisma } from "../src/server/db/prisma";

runPendingMigrations()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("[prebuild migrate] failed:", error);
    await prisma.$disconnect();
    // Non-fatal on purpose — same reasoning as the boot-time call: a
    // missing/misconfigured DATABASE_URL at build time (e.g. a build
    // preview environment with no database at all) shouldn't block the
    // build outright when it might not even need to touch new schema.
    // Any static page that genuinely needs the new columns still fails
    // loudly with its own clear Prisma error either way.
  });
