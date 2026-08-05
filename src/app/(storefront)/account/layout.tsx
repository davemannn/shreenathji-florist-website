import { AccountNav } from "@/features/account/components/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="text-3xl">Your Account</h1>
      <div className="mt-6">
        <AccountNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
