import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { utilityNav } from "@/config/navigation";

/** Small info strip above the main header row — hidden on mobile, matches the Florial reference's utility bar. */
export function TopUtilityBar() {
  return (
    <div className="bg-foreground text-background hidden text-xs md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden="true" />
            {siteConfig.contact.address}
          </span>
          <a
            href={siteConfig.contact.phoneHref}
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <Phone className="size-3.5" aria-hidden="true" />
            {siteConfig.contact.phone}
          </a>
        </div>
        <nav aria-label="Utility links" className="flex items-center gap-4">
          {utilityNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
