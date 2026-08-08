import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailFooter } from "./components/email-footer";

interface NewsletterConfirmEmailProps {
  confirmUrl: string;
  storeAddressLine?: string;
  storeCity?: string;
  storePincode?: string;
}

/** Double opt-in confirmation — a subscriber row exists but isConfirmed stays false (and is never emailed by the marketing sender) until this link is clicked. */
export function NewsletterConfirmEmail({
  confirmUrl,
  storeAddressLine,
  storeCity,
  storePincode,
}: NewsletterConfirmEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your Shreenathji Florist newsletter subscription</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            One more step
          </Heading>
          <Text style={{ margin: "4px 0" }}>
            Confirm your email to start receiving offers and updates from Shreenathji Florist.
          </Text>
          <Section style={{ margin: "24px 0", textAlign: "center" }}>
            <Link
              href={confirmUrl}
              style={{
                backgroundColor: "#c9105f",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Confirm Subscription
            </Link>
          </Section>
          <Text style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
            Didn&rsquo;t sign up for this? Just ignore this email — you won&rsquo;t be subscribed.
          </Text>

          <EmailFooter addressLine={storeAddressLine} city={storeCity} pincode={storePincode} />
        </Container>
      </Body>
    </Html>
  );
}

export default NewsletterConfirmEmail;
