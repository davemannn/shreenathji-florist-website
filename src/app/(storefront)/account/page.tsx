import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export const metadata: Metadata = {
  title: "Your Account",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?redirectTo=/account");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6 lg:px-8">
      <h1 className="text-3xl">Your Account</h1>
      <div className="mt-8 flex flex-col gap-1 border-b pb-8">
        <p className="text-sm">
          <span className="text-muted-foreground">Name: </span>
          {session.user.name}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Email: </span>
          {session.user.email}
        </p>
      </div>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </div>
  );
}
