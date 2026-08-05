import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { ProfileForm } from "@/features/account/components/profile-form";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export const metadata: Metadata = {
  title: "Edit Profile",
};

export default async function AccountProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in?redirectTo=/account/profile");
  }

  return (
    <div className="flex flex-col gap-8">
      <ProfileForm name={session.user.name} email={session.user.email} />
      <div className="border-t pt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
