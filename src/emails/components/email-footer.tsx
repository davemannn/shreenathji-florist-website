import { Hr, Link, Text } from "@react-email/components";

interface EmailFooterProps {
  addressLine?: string;
  city?: string;
  pincode?: string;
  /** Present only on marketing/newsletter sends — transactional email (order/OTP) has no unsubscribe requirement. */
  unsubscribeUrl?: string;
}

/**
 * Shared footer for every email template from the order-confirmation
 * milestone onward — none of the earlier templates (gift card, contact,
 * abandoned cart) had one. Business address here matters for real
 * compliance (India's Consumer Protection Act e-commerce rules, and
 * general CAN-SPAM-style norms most providers expect); the unsubscribe
 * link only renders when a caller actually passes one, so transactional
 * sends don't imply an opt-out relationship that isn't real.
 */
export function EmailFooter({ addressLine, city, pincode, unsubscribeUrl }: EmailFooterProps) {
  const address = [addressLine, city, pincode].filter(Boolean).join(", ");

  return (
    <>
      <Hr style={{ margin: "24px 0 12px", borderColor: "#eee" }} />
      <Text style={{ margin: "2px 0", fontSize: "11px", color: "#999" }}>
        Shreenathji Florist{address ? ` · ${address}` : ""}
      </Text>
      {unsubscribeUrl ? (
        <Text style={{ margin: "2px 0", fontSize: "11px", color: "#999" }}>
          <Link href={unsubscribeUrl} style={{ color: "#999" }}>
            Unsubscribe
          </Link>{" "}
          from marketing emails — you&rsquo;ll still get order and account emails.
        </Text>
      ) : null}
    </>
  );
}
