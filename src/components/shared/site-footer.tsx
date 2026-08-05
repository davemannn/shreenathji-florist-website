import { FacebookIcon, InstagramIcon } from "@/components/shared/icons/social-icons";
import { Logo } from "@/components/shared/logo";
import { FooterColumns } from "@/components/shared/footer/footer-columns";
import { NewsletterForm } from "@/components/shared/footer/newsletter-form";
import { PaymentIcons } from "@/components/shared/footer/payment-icons";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="text-background bg-[#222222]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.2fr_2fr] lg:px-8">
        <div className="flex flex-col gap-4">
          <Logo className="text-background" />
          <p className="text-background/70 max-w-sm text-sm">{siteConfig.description}</p>
          <div className="flex items-center gap-3">
            <a
              href={siteConfig.social.instagram}
              aria-label="Instagram"
              className="text-background/70 hover:text-background"
            >
              <InstagramIcon className="size-5" aria-hidden="true" />
            </a>
            <a
              href={siteConfig.social.facebook}
              aria-label="Facebook"
              className="text-background/70 hover:text-background"
            >
              <FacebookIcon className="size-5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <FooterColumns />

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Our Newsletter</h3>
          <p className="text-background/70 mt-2 max-w-sm text-sm">
            Sign up for seasonal offers, fresh arrivals & exclusive discounts.
          </p>
          <div className="mt-4 max-w-sm">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-background/10 border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs sm:flex-row md:px-6 lg:px-8">
          <p className="text-background/60">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <PaymentIcons />
        </div>
      </div>
    </footer>
  );
}
