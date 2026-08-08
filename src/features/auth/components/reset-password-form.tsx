"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordValues } from "../validations";

export function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", password: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    // One step — the OTP and the new password are validated and applied
    // together, no separate "verify the code first" call.
    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp: values.otp,
      password: values.password,
    });
    if (error) {
      toast.error(error.message ?? "That code didn't work. Check it and try again.");
      return;
    }
    toast.success("Password updated — sign in with your new password.");
    router.push("/sign-in");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-muted-foreground text-center text-sm">
        Enter the code sent to <span className="text-foreground font-medium">{email}</span> and
        choose a new password.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="otp">Verification code</Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="text-center text-lg tracking-[0.4em]"
          aria-invalid={!!errors.otp}
          {...register("otp")}
        />
        {errors.otp ? <p className="text-destructive text-xs">{errors.otp.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        ) : null}
      </div>
      <Button type="submit" variant="brand" disabled={isSubmitting} className="h-10">
        {isSubmitting ? "Resetting…" : "Reset Password"}
      </Button>
    </form>
  );
}
