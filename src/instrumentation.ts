/**
 * TEMPORARY deploy diagnostic — remove once the Hostinger DB connection
 * issue is resolved. Runs once when the server starts (see Next.js's
 * instrumentation.ts convention) and logs whether DATABASE_URL actually
 * reached the running process, and what it parses to. Never logs the
 * password itself, only whether it's present and how long it is.
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[startup-diagnostic] DATABASE_URL is NOT set in this environment.");
    return;
  }

  try {
    const parsed = new URL(url);
    console.log(
      `[startup-diagnostic] DATABASE_URL is set (raw length=${url.length}). ` +
        `Parsed -> protocol=${parsed.protocol} host=${parsed.hostname} port=${parsed.port || "(default)"} ` +
        `database=${parsed.pathname.replace(/^\//, "")} username=${parsed.username ? `"${parsed.username}"` : "(empty)"} ` +
        `password=${parsed.password ? `(set, length=${parsed.password.length})` : "(empty)"}`,
    );
  } catch (error) {
    console.log(
      `[startup-diagnostic] DATABASE_URL is set (raw length=${url.length}) but failed to parse as a URL: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
