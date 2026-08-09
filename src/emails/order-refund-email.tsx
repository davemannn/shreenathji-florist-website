import { Body, Container, Heading, Head, Html, Link, Preview, Text } from "@react-email/components";
import { formatINR } from "@/lib/format";
import { EmailFooter } from "./components/email-footer";

interface OrderRefundEmailProps {
  customerName: string;
  orderNumber: string;
  amount: number;
  isFullRefund: boolean;
  trackOrderUrl: string;
  storeAddressLine?: string;
  storeCity?: string;
  storePincode?: string;
}

/** Fires once per processRefundAction call — a second partial refund on the same order sends a second one of these, each with its own amount. */
export function OrderRefundEmail({
  customerName,
  orderNumber,
  amount,
  isFullRefund,
  trackOrderUrl,
  storeAddressLine,
  storeCity,
  storePincode,
}: OrderRefundEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${formatINR(amount)} refund processed for order ${orderNumber}`}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            Refund processed
          </Heading>
          <Text style={{ margin: "4px 0" }}>
            Hi {customerName}, we&rsquo;ve processed a {formatINR(amount)}{" "}
            {isFullRefund ? "refund" : "partial refund"} for order <strong>{orderNumber}</strong>.
            It should reflect in your original payment method within 5-7 business days, depending on
            your bank.
          </Text>
          <Text style={{ margin: "16px 0 4px", fontSize: "13px" }}>
            <Link href={trackOrderUrl} style={{ color: "#c9105f" }}>
              View order details
            </Link>
          </Text>

          <EmailFooter addressLine={storeAddressLine} city={storeCity} pincode={storePincode} />
        </Container>
      </Body>
    </Html>
  );
}

export default OrderRefundEmail;
