import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-heading text-xl tracking-tight whitespace-nowrap italic md:text-2xl",
        className,
      )}
    >
      {siteConfig.name}
    </Link>
  );
}
