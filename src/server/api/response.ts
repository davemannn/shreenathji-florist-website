import { NextResponse } from "next/server";

/**
 * Shared envelope for every /api/v1/* route — `{ data }` on success,
 * `{ error }` on failure, so a client (the future mobile app this was
 * built for) only ever needs one response shape to branch on.
 */
export function apiSuccess<T>(data: T, init?: number | ResponseInit): NextResponse {
  return NextResponse.json({ data }, typeof init === "number" ? { status: init } : init);
}

export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Wraps a route body so a thrown Error (the pattern every server action in this codebase already uses for user-facing failures) becomes a 400 instead of an unhandled 500. */
export async function withApiErrors(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Something went wrong.", 400);
  }
}
