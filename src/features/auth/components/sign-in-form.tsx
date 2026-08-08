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
// Pure logic, no server-only deps despite living under src/server/ — safe to
// import client-side (see the comment on isAdminRole itself).
import { isAdminRole } from "@/server/auth/permissions";
import { signInSchema, type SignInValues } from "../validations";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    const { data, error } = await authClient.signIn.email(values);
    if (error) {
      // requireEmailVerification (server/auth/config.ts) makes sign-in
      // 403 for a correct-but-unverified account — the only case this
      // route ever returns 403 for (bad credentials is 401) — so status
      // alone reliably distinguishes it from a wrong password.
      if (error.status === 403) {
        await authClient.emailOtp.sendVerificationOtp({
          email: values.email,
          type: "email-verification",
        });
        toast.info("Please verify your email first — we've sent you a new code.");
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
        return;
      }
      toast.error(error.message ?? "Couldn't sign in. Check your email and password.");
      return;
    }

    // No explicit redirectTo (e.g. proxy.ts sending someone back to the admin
    // page they tried to reach) means this was a plain /sign-in visit — send
    // staff straight to the dashboard instead of the customer homepage.
    const hasExplicitRedirect = searchParams.get("redirectTo");
    const destination =
      !hasExplicitRedirect && isAdminRole(data?.user.role) ? "/admin" : redirectTo;

    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-muted-foreground text-xs underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        ) : null}
      </div>
      <Button type="submit" variant="brand" disabled={isSubmitting} className="mt-2 h-10">
        {isSubmitting ? "Signing in…" : "Sign In"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </form>
  );
}
