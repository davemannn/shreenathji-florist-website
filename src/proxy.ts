import { NextResponse } from "next/server";

// PLACEHOLDER — currently a no-op pass-through.
// Once the auth-strategy milestone lands, this will gate the (admin) route
// group by session + role (admin/staff only), matching the "admin is a
// protected surface" decision in the scaffolding plan.
// (Next.js 16 renamed the "middleware" file convention to "proxy" — this
// file and export follow that current convention.)
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
