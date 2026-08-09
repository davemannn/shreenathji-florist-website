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

interface AdminNewOrderAlertEmailProps {
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: "COD" | "RAZORPAY" | "WALLET";
  /** ₹ of `total` paid from wallet balance — 0 if none used. Matters most for COD: cash due on delivery is `total - walletAmountUsed`, not the full total. */
  walletAmountUsed?: number;
  orderUrl: string;
}

/**
 * Sent to the store's own inbox (STORE_INBOX in mailer.ts) on every new
 * order — the email equivalent of the in-app dashboard chime, for whenever
 * nobody has an admin tab open. Internal notification, same skeleton as
 * contact-message-email.tsx — no footer/unsubscribe needed, this isn't
 * customer-facing.
 */
export function AdminNewOrderAlertEmail({
  orderNumber,
  customerName,
  total,
  paymentMethod,
  walletAmountUsed = 0,
  orderUrl,
}: AdminNewOrderAlertEmailProps) {
  const paymentLabel =
    paymentMethod === "WALLET"
      ? "Paid from wallet"
      : paymentMethod === "COD"
        ? `Cash on Delivery${walletAmountUsed > 0 ? ` — collect ${formatINR(total - walletAmountUsed)} (${formatINR(walletAmountUsed)} already paid from wallet)` : ""}`
        : `Paid online${walletAmountUsed > 0 ? ` · ${formatINR(walletAmountUsed)} from wallet` : ""}`;

  return (
    <Html>
      <Head />
      <Preview>
        New order {orderNumber} — {formatINR(total)}
      </Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            New order — {formatINR(total)}
          </Heading>
          <Section>
            <Text style={{ margin: "4px 0" }}>
              <strong>Order:</strong> {orderNumber}
            </Text>
            <Text style={{ margin: "4px 0" }}>
              <strong>Customer:</strong> {customerName}
            </Text>
            <Text style={{ margin: "4px 0" }}>
              <strong>Payment:</strong> {paymentLabel}
            </Text>
          </Section>
          <Text style={{ margin: "16px 0 4px", fontSize: "13px" }}>
            <Link href={orderUrl} style={{ color: "#c9105f" }}>
              View in admin panel
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AdminNewOrderAlertEmail;
