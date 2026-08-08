import { Body, Container, Heading, Head, Html, Preview, Text } from "@react-email/components";
import { EmailFooter } from "./components/email-footer";

interface MarketingEmailProps {
  subject: string;
  body: string;
  unsubscribeUrl: string;
  storeAddressLine?: string;
  storeCity?: string;
  storePincode?: string;
}

/** The one template every admin bulk/marketing send (features/marketing-email) uses — subject/body are staff-authored, everything else (footer, unsubscribe) is enforced here so a campaign can't accidentally ship without them. */
export function MarketingEmail({
  subject,
  body,
  unsubscribeUrl,
  storeAddressLine,
  storeCity,
  storePincode,
}: MarketingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            {subject}
          </Heading>
          {body.split("\n").map((paragraph, index) =>
            paragraph.trim() ? (
              <Text key={index} style={{ margin: "8px 0", fontSize: "14px" }}>
                {paragraph}
              </Text>
            ) : null,
          )}

          <EmailFooter
            addressLine={storeAddressLine}
            city={storeCity}
            pincode={storePincode}
            unsubscribeUrl={unsubscribeUrl}
          />
        </Container>
      </Body>
    </Html>
  );
}

export default MarketingEmail;
