"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../validations";

export function ForgotPasswordForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    // Always succeeds regardless of whether the email exists — anti-
    // enumeration by design (better-auth's own endpoint behavior), so
    // there's deliberately no "email not found" branch here.
    await authClient.emailOtp.requestPasswordReset({ email: values.email });
    toast.success("If that email has an account, a code is on its way.");
    router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-muted-foreground text-center text-sm">
        Enter your account email and we&rsquo;ll send you a code to reset your password.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email ? <p className="text-destructive text-xs">{errors.email.message}</p> : null}
      </div>
      <Button type="submit" variant="brand" disabled={isSubmitting} className="h-10">
        {isSubmitting ? "Sending…" : "Send Code"}
      </Button>
    </form>
  );
}
