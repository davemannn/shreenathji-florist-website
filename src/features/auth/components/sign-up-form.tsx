"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyReferralCodeAction } from "@/features/referral/actions";
import { signUpSchema, type SignUpValues } from "../validations";
import { GoogleSignInButton } from "./google-sign-in-button";

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: SignUpValues) {
    const { data, error } = await authClient.signUp.email(values);
    if (error) {
      toast.error(error.message ?? "Couldn't create your account. Try a different email.");
      return;
    }

    // Best-effort, never blocks signup — an invalid/expired/missing code
    // just silently doesn't attach a referrer (see applyReferralCodeAction).
    if (referralCode && data?.user.id) {
      try {
        await applyReferralCodeAction(data.user.id, referralCode);
      } catch {
        // Not fatal to signup either way.
      }
    }

    // requireEmailVerification is on (see server/auth/config.ts) — sign-up
    // doesn't create a session yet, and better-auth has already fired the
    // first verification OTP. Go straight to entering it.
    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {googleEnabled ? (
        <>
          <GoogleSignInButton />
          <div className="flex items-center gap-3">
            <span className="border-border h-px flex-1 border-t" />
            <span className="text-muted-foreground text-xs">or</span>
            <span className="border-border h-px flex-1 border-t" />
          </div>
        </>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name ? <p className="text-destructive text-xs">{errors.name.message}</p> : null}
        </div>
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
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
        <Button type="submit" variant="brand" disabled={isSubmitting} className="mt-2 h-10">
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
