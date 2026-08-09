import { Body, Container, Heading, Head, Html, Link, Preview, Text } from "@react-email/components";
import { EmailFooter } from "./components/email-footer";

interface ReminderEmailProps {
  customerName: string;
  occasionLabel: string;
  recipientName: string;
  daysAhead: number;
  shopUrl: string;
  storeAddressLine?: string;
  storeCity?: string;
  storePincode?: string;
}

/** Sent by the /api/cron/send-reminders route, N days ahead of a saved date — see that route's own doc comment for how it's actually triggered. */
export function ReminderEmail({
  customerName,
  occasionLabel,
  recipientName,
  daysAhead,
  shopUrl,
  storeAddressLine,
  storeCity,
  storePincode,
}: ReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${recipientName}'s ${occasionLabel.toLowerCase()} is in ${daysAhead} days`}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            {recipientName}&rsquo;s {occasionLabel.toLowerCase()} is coming up!
          </Heading>
          <Text style={{ margin: "4px 0" }}>
            Hi {customerName}, just a heads up — {recipientName}&rsquo;s{" "}
            {occasionLabel.toLowerCase()} is in {daysAhead} day{daysAhead === 1 ? "" : "s"}. Order
            today for on-time delivery.
          </Text>
          <Text style={{ margin: "16px 0 4px", fontSize: "13px" }}>
            <Link href={shopUrl} style={{ color: "#c9105f" }}>
              Shop flowers & gifts
            </Link>
          </Text>

          <EmailFooter addressLine={storeAddressLine} city={storeCity} pincode={storePincode} />
        </Container>
      </Body>
    </Html>
  );
}

export default ReminderEmail;
