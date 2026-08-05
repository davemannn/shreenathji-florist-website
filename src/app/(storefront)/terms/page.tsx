import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions for using the Shreenathji Florist website and placing orders.",
};

const LAST_UPDATED = "August 5, 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <h1 className="text-3xl md:text-4xl">Terms of Use</h1>
      <p className="text-muted-foreground mt-2 text-sm">Last updated: {LAST_UPDATED}</p>

      <div className="text-muted-foreground mt-10 flex flex-col gap-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the {siteConfig.name} website (&quot;we&quot;, &quot;us&quot;,
            &quot;our website&quot;), you agree to be bound by these Terms of Use and our Privacy
            Policy. If you do not agree, please do not use this website.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">2. Orders & Acceptance</h2>
          <p>
            Placing an order on this website is an offer to purchase, which we may accept or
            decline. We reserve the right to refuse or cancel any order for reasons including
            product unavailability, delivery-area limitations, pricing errors, or suspected fraud.
            If we cancel an order after payment has been collected, we will issue a full refund to
            the original payment method.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">3. Pricing & Payment</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes
            unless stated otherwise. We accept payment via Razorpay (UPI, credit/debit cards,
            netbanking) and Cash on Delivery, where available. Delivery charges, if any, are shown
            at checkout before payment.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">4. Delivery</h2>
          <p>
            Delivery windows (Standard, Instant/Express, and Midnight) are estimates, not
            guarantees. While we make every reasonable effort to deliver within the selected window,
            delays can occur due to weather, traffic, incorrect address details, or recipient
            unavailability. Same-day Midnight bookings must be placed before the daily cutoff shown
            at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">
            5. Product Representation
          </h2>
          <p>
            Flowers are a natural product — actual colour, variety availability, and arrangement
            style may vary slightly from the photos shown, depending on seasonal availability. We
            substitute with an item of equal or greater value whenever an exact match isn&apos;t
            available, and always aim to preserve the overall look and feel of your order.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">
            6. Cancellations & Refunds
          </h2>
          <p>
            Orders can be cancelled free of charge up to a reasonable time before the scheduled
            delivery (contact us as soon as possible). Because flowers and cakes are perishable, we
            cannot accept cancellations once an order is out for delivery. If an item arrives
            damaged or incorrect, contact us within 24 hours of delivery for a replacement or
            refund.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">7. Decoration Services</h2>
          <p>
            Custom decoration bookings (weddings, proposals, parties, memorial setups, etc.) are
            quoted individually based on occasion, venue and requirements. A booking is confirmed
            only once both parties agree on scope and price, typically over phone or WhatsApp.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">8. Intellectual Property</h2>
          <p>
            All content on this website — including text, images, logos and design — is the property
            of {siteConfig.name} or its licensors and may not be reproduced without permission.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">
            9. Limitation of Liability
          </h2>
          <p>
            To the extent permitted by law, {siteConfig.name} is not liable for indirect or
            consequential losses arising from use of this website or delayed/failed deliveries
            beyond our reasonable control.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">
            10. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. Continued use of the website after changes
            are posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">11. Contact</h2>
          <p>
            Questions about these Terms? Reach us at{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-brand hover:underline">
              {siteConfig.contact.email}
            </a>{" "}
            or {siteConfig.contact.phone}.
          </p>
        </section>
      </div>
    </div>
  );
}
