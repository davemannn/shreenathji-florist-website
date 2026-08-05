import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream flex min-h-full flex-col items-center justify-center gap-8 px-4 py-16">
      <Logo />
      <div className="bg-background w-full max-w-sm rounded-xs border p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
