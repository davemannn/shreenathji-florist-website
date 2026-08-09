import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in to your account</p>
      </div>
      {/* SignInForm reads ?redirectTo via useSearchParams, which requires a Suspense boundary. */}
      <Suspense>
        <SignInForm googleEnabled={googleEnabled} />
      </Suspense>
    </div>
  );
}
