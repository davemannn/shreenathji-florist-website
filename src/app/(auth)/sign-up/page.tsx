import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignUpPage() {
  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl">Create your account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Fresh flowers, delivered across Vadodara
        </p>
      </div>
      <SignUpForm googleEnabled={googleEnabled} />
    </div>
  );
}
