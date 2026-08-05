import Link from "next/link";
import { footerColumns } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function FooterColumns() {
  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
      {footerColumns.map((column) => (
        <div key={column.title}>
          <h3 className="text-sm font-semibold tracking-wide uppercase">{column.title}</h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {column.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-background/70 hover:text-background text-sm">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase">Areas We Deliver</h3>
        <ul className="mt-4 flex flex-col gap-2.5">
          {siteConfig.serviceAreas.map((area) => (
            <li key={area} className="text-background/70 text-sm">
              {area}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
