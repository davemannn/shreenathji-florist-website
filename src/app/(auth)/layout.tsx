import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream flex min-h-full flex-col items-center justify-center gap-8 px-4 py-16">
      <Logo dark className="h-28 w-28 md:h-32 md:w-32" />
      <div className="bg-background w-full max-w-sm rounded-xs border p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
