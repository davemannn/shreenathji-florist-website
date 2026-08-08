import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
  /**
   * The source file (public/logo.PNG) is a full lockup — an illustrated
   * mark plus "Shrinathji Florist" wordmark — rendered as monochrome white
   * on a transparent background. Correct as-is on a dark surface (the
   * footer); invisible on a light one. `dark` renders the same asset
   * inverted to black instead of needing a second file.
   */
  dark?: boolean;
  /** Where the logo links — "/" on the storefront, "/admin" inside the admin shell. */
  href?: string;
}

export function Logo({ className, dark = false, href = "/" }: LogoProps) {
  return (
    <Link href={href} className="inline-flex items-center">
      <Image
        src="/logo.PNG"
        alt={siteConfig.name}
        width={875}
        height={875}
        priority
        // Square source, but it's a tall lockup (icon + two lines of text)
        // — sized generously by default so the wordmark stays legible.
        // `className` (twMerge-resolved) overrides the size per call site —
        // it must land on the sized element itself, not the Link wrapper.
        className={cn("h-20 w-20 md:h-24 md:w-24", dark && "invert", className)}
      />
    </Link>
  );
}
