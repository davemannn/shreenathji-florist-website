"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { otpSchema, type OtpValues } from "../validations";

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onSubmit(values: OtpValues) {
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp: values.otp });
    if (error) {
      toast.error(error.message ?? "That code didn't work. Check it and try again.");
      return;
    }
    toast.success("Email verified — you can sign in now.");
    router.push("/sign-in");
  }

  async function handleResend() {
    setResending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) {
        toast.error(error.message ?? "Couldn't resend the code.");
        return;
      }
      toast.success("A new code is on its way.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-muted-foreground text-center text-sm">
        We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>. It
        expires in 5 minutes.
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
      <Button type="submit" variant="brand" disabled={isSubmitting} className="h-10">
        {isSubmitting ? "Verifying…" : "Verify Email"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={resending}
        onClick={handleResend}
        className="h-9 text-sm"
      >
        {resending ? "Sending…" : "Resend code"}
      </Button>
    </form>
  );
}
