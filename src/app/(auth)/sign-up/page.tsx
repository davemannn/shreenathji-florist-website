import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl">Create your account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Fresh flowers, delivered across Vadodara
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
