import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/features/contact/components/contact-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Shreenathji Florist — call, WhatsApp or send us a message. Serving Alkapuri, Gotri, Sayajigunj, Karelibaug, Manjalpur and Old Padra Road, Vadodara.",
};

const DETAILS = [
  {
    icon: Phone,
    label: "Phone",
    value: siteConfig.contact.phone,
    href: siteConfig.contact.phoneHref,
  },
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
  },
  { icon: MapPin, label: "Address", value: siteConfig.contact.address, href: undefined },
  { icon: Clock, label: "Store Hours", value: "Every day · 9:00 AM – 9:00 PM", href: undefined },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">Get In Touch</p>
        <h1 className="mt-3 text-3xl md:text-5xl">We&apos;d Love To Hear From You</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm md:text-base">
          Questions about an order, a custom bouquet, or decor for your event — reach out any way
          that&apos;s easiest for you.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="brand"
              size="lg"
              nativeButton={false}
              render={<a href={siteConfig.contact.phoneHref} />}
            >
              <Phone className="size-4" aria-hidden="true" />
              Call Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={
                <a
                  href={siteConfig.contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp
            </Button>
          </div>

          <ul className="flex flex-col gap-5">
            {DETAILS.map((detail) => (
              <li key={detail.label} className="flex items-start gap-3">
                <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
                  <detail.icon className="size-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    {detail.label}
                  </p>
                  {detail.href ? (
                    <a href={detail.href} className="text-sm font-medium hover:underline">
                      {detail.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium">{detail.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="border-border overflow-hidden rounded-xs border">
            <iframe
              title="Shreenathji Florist location — Vadodara, Gujarat"
              src="https://maps.google.com/maps?q=Vadodara%2C%20Gujarat&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="border-border rounded-xs border p-6 md:p-8">
          <h2 className="mb-6 text-lg font-semibold">Send Us a Message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
