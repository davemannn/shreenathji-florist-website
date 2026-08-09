"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1C3.24 21.3 7.28 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.26a12 12 0 0 0 0 10.74l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.63l4.01 3.1C6.22 6.87 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

/**
 * Only rendered by the sign-in/sign-up pages when GOOGLE_CLIENT_ID is set
 * server-side (see server/auth/config.ts) — this component itself doesn't
 * re-check that, it just does the sign-in call. If Google isn't
 * configured, better-auth's own error response covers it either way.
 */
export function GoogleSignInButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
      if (error) {
        toast.error(error.message ?? "Couldn't sign in with Google.");
        setLoading(false);
      }
      // On success, better-auth redirects the browser to Google itself —
      // nothing left to do here, and setLoading(false) would just flash.
    } catch {
      toast.error("Couldn't sign in with Google.");
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 w-full gap-2"
      disabled={loading}
      onClick={handleClick}
    >
      <GoogleIcon />
      {loading ? "Redirecting…" : "Continue with Google"}
    </Button>
  );
}
