import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : undefined;
  if (!email) redirect("/forgot-password");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl">Reset your password</h1>
      </div>
      <ResetPasswordForm email={email} />
    </div>
  );
}
