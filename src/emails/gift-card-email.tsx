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
import { formatINR } from "@/lib/format";

interface GiftCardEmailProps {
  code: string;
  amount: number;
  purchaserName: string;
  recipientName?: string;
  message?: string;
  isForSelf: boolean;
  /** Where to redeem the code (account page) — SELF cards are already redeemed by the time this sends, so this is only ever shown for a gifted card. */
  redeemUrl: string;
}

export function GiftCardEmail({
  code,
  amount,
  purchaserName,
  recipientName,
  message,
  isForSelf,
  redeemUrl,
}: GiftCardEmailProps) {
  const greeting = isForSelf
    ? "Here's your gift card"
    : `${recipientName ?? "You"}, you've received a gift card!`;

  return (
    <Html>
      <Head />
      <Preview>{`A ${formatINR(amount)} Shrinathji Florist gift card ${isForSelf ? "for you" : `from ${purchaserName}`}`}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            {greeting}
          </Heading>
          {!isForSelf ? (
            <Text style={{ margin: "4px 0" }}>
              <strong>{purchaserName}</strong> sent you a Shrinathji Florist gift card.
            </Text>
          ) : null}
          <Section
            style={{
              margin: "20px 0",
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "#c9105f",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            <Text style={{ margin: 0, fontSize: "14px", opacity: 0.85 }}>Gift Card Value</Text>
            <Text style={{ margin: "4px 0", fontSize: "28px", fontWeight: "bold" }}>
              {formatINR(amount)}
            </Text>
            <Text style={{ margin: "12px 0 0", fontSize: "16px", letterSpacing: "2px" }}>
              {code}
            </Text>
          </Section>
          {message ? (
            <Text style={{ margin: "16px 0 4px", whiteSpace: "pre-wrap", fontStyle: "italic" }}>
              &ldquo;{message}&rdquo;
            </Text>
          ) : null}
          {isForSelf ? (
            <Text style={{ margin: "16px 0 4px", fontSize: "13px", color: "#666" }}>
              This has already been added to your wallet balance — spend it at checkout on your next
              order.
            </Text>
          ) : (
            <Text style={{ margin: "16px 0 4px", fontSize: "13px", color: "#666" }}>
              To use it, sign in and redeem this code on your{" "}
              <Link href={redeemUrl} style={{ color: "#c9105f" }}>
                account page
              </Link>{" "}
              — it&rsquo;ll be added to your wallet balance, ready to spend at checkout.
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}

export default GiftCardEmail;
