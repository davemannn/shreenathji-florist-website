import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Shrinathji Florist collects, uses and protects your personal information.",
};

const LAST_UPDATED = "August 5, 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <h1 className="text-3xl md:text-4xl">Privacy Policy</h1>
      <p className="text-muted-foreground mt-2 text-sm">Last updated: {LAST_UPDATED}</p>

      <div className="text-muted-foreground mt-10 flex flex-col gap-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">
            1. Information We Collect
          </h2>
          <p>When you create an account, place an order, or contact us, we may collect:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>Name, email address, and phone number</li>
            <li>Delivery addresses and recipient details</li>
            <li>Order history and preferences</li>
            <li>
              Payment confirmation details from Razorpay (we never store your card, UPI PIN, or
              netbanking credentials)
            </li>
            <li>Messages you send us via the contact form</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">
            2. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>Process and deliver your orders</li>
            <li>Send order confirmations and delivery updates</li>
            <li>Respond to enquiries and customer support requests</li>
            <li>Improve our website, products, and services</li>
            <li>Send occasional offers or newsletters, only if you&apos;ve opted in</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">3. Payment Information</h2>
          <p>
            Online payments are processed by Razorpay, a PCI-DSS compliant payment gateway. Your
            card, UPI, and banking details are handled directly by Razorpay and are never stored on
            our servers.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">
            4. Sharing of Information
          </h2>
          <p>
            We do not sell your personal information. We share it only with service providers
            necessary to run our business — such as our payment gateway (Razorpay), transactional
            email provider, and delivery staff for fulfilling your order — and only to the extent
            needed for that purpose.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">5. Cookies</h2>
          <p>
            We use essential cookies to keep you signed in and to remember items in your cart. We do
            not use these cookies for third-party advertising.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">6. Data Retention</h2>
          <p>
            We retain your account and order information for as long as your account is active, or
            as needed to comply with legal, tax, and accounting obligations.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">7. Your Rights</h2>
          <p>
            You can review and update your profile and saved addresses anytime from your account
            dashboard. To request deletion of your account or data, contact us using the details
            below.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">
            8. Children&apos;s Privacy
          </h2>
          <p>
            Our website is not directed at children under 18, and we do not knowingly collect
            personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be reflected
            by updating the &quot;Last updated&quot; date above.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-2 text-base font-semibold">10. Contact Us</h2>
          <p>
            For privacy-related questions or requests, reach us at{" "}
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
