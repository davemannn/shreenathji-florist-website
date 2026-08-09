/**
 * Runs once when this Next.js server instance boots (see
 * node_modules/next/dist/docs/.../instrumentation.md), and — per Next's own
 * docs — is guaranteed to *complete* before the server accepts any
 * requests. The actual logic lives in instrumentation-node.ts (see its own
 * doc comment for what and why); this file just gates it to the Node.js
 * runtime and stays free of any Node-only imports itself, which is what
 * keeps Next's bundler from flagging Edge-runtime incompatibility warnings
 * for code that, thanks to the guard below, never actually runs there.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  await import("./instrumentation-node");
}
