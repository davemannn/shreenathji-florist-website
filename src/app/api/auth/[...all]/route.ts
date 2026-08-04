// Better Auth catch-all route handler — STUB.
// Will delegate to the configured Better Auth instance (src/server/auth/config.ts)
// once the auth-strategy milestone is approved and implemented. Returns 501
// deliberately so any accidental early call fails loudly instead of silently.
import { NextResponse } from "next/server";

function notConfigured() {
  return NextResponse.json({ error: "Auth is not configured yet." }, { status: 501 });
}

export const GET = notConfigured;
export const POST = notConfigured;
