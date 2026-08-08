import Script from "next/script";
import { SectionHeading } from "@/components/shared/section-heading";
import { InstagramIcon } from "@/components/shared/icons/social-icons";
import { siteConfig } from "@/config/site";

/**
 * Real Instagram data (follower count + recent posts), via SociableKit's
 * embed widget — chosen over building a direct Instagram Graph API
 * integration, which would need a Business-linked Facebook Developer App
 * and an access token that expires every ~60 days and needs refreshing.
 * SociableKit's script populates the container div client-side once it
 * loads; there's no server-side data fetching on our end anymore.
 */
export function InstagramGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      <SectionHeading eyebrow="#SendHappy" title="Follow Us on Instagram" />
      <a
        href={siteConfig.social.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand mb-10 flex items-center justify-center gap-1.5 text-sm font-medium hover:underline"
      >
        <InstagramIcon className="size-4" aria-hidden="true" />
        @shrinathjiflorist
      </a>
      <div className="sk-instagram-feed" data-embed-id="25703782" />
      <Script
        id="sociablekit-instagram-feed"
        src="https://widgets.sociablekit.com/instagram-feed/widget.js"
        strategy="afterInteractive"
      />
    </section>
  );
}
