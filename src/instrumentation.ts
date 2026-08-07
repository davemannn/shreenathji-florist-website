/**
 * TEMPORARY deploy diagnostic — remove once the Hostinger DB connection
 * issue is resolved. Runs once when the server starts (see Next.js's
 * instrumentation.ts convention).
 *
 * Two checks:
 * 1. What DATABASE_URL actually parsed to (never logs the password itself,
 *    only whether it's present and how long it is).
 * 2. A bare `net.connect` TCP probe straight to the DB host:port, bypassing
 *    Prisma/mariadb entirely — this isolates whether the container's own
 *    outbound networking can reach the database at all, independent of any
 *    driver/pool configuration. A second probe to a known public HTTPS host
 *    confirms whether outbound networking works in general or only port
 *    3306 specifically is blocked.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const tag = `[startup-diagnostic pid=${process.pid}]`;
  console.log(`${tag} register() called.`);

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log(`${tag} DATABASE_URL is NOT set in this environment.`);
    return;
  }

  let host: string | undefined;
  let port: number | undefined;

  try {
    const parsed = new URL(url);
    host = parsed.hostname;
    port = parsed.port ? Number(parsed.port) : 3306;
    console.log(
      `${tag} DATABASE_URL is set (raw length=${url.length}). ` +
        `Parsed -> protocol=${parsed.protocol} host=${parsed.hostname} port=${parsed.port || "(default)"} ` +
        `database=${parsed.pathname.replace(/^\//, "")} username=${parsed.username ? `"${parsed.username}"` : "(empty)"} ` +
        `password=${parsed.password ? `(set, length=${parsed.password.length})` : "(empty)"}`,
    );
  } catch (error) {
    console.log(
      `${tag} DATABASE_URL is set (raw length=${url.length}) but failed to parse as a URL: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return;
  }

  const { connect } = await import("net");

  function probe(label: string, targetHost: string, targetPort: number): Promise<void> {
    return new Promise((resolve) => {
      const start = Date.now();
      const socket = connect({ host: targetHost, port: targetPort, timeout: 5000 });
      socket.on("connect", () => {
        console.log(`${tag} TCP probe ${label} -> SUCCESS in ${Date.now() - start}ms`);
        socket.end();
        resolve();
      });
      socket.on("timeout", () => {
        console.log(`${tag} TCP probe ${label} -> TIMEOUT after ${Date.now() - start}ms`);
        socket.destroy();
        resolve();
      });
      socket.on("error", (err) => {
        console.log(
          `${tag} TCP probe ${label} -> ERROR after ${Date.now() - start}ms: ${err.message}`,
        );
        resolve();
      });
    });
  }

  await probe(`db (${host}:${port})`, host, port);
  await probe("control (api.github.com:443)", "api.github.com", 443);
  console.log(`${tag} done.`);
}
