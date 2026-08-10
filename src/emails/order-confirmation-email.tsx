import {
  Body,
  Container,
  Heading,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { formatINR, formatDate } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { EmailFooter } from "./components/email-footer";

interface OrderConfirmationEmailItem {
  productTitle: string;
  variantLabel?: string;
  quantity: number;
  lineTotal: number;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  items: OrderConfirmationEmailItem[];
  deliveryDate: string;
  deliverySlotLabel?: string;
  deliveryAddress: string;
  total: number;
  paymentMethod: "COD" | "RAZORPAY" | "WALLET";
  /** ₹ of `total` paid from wallet balance — 0 if none used. */
  walletAmountUsed?: number;
  invoiceUrl: string;
  storeAddressLine?: string;
  storeCity?: string;
  storePincode?: string;
}

/**
 * Fires at order confirmation (COD accept / Razorpay payment verified) —
 * not held until delivery, since that's when the invoice number already
 * exists (see order.repository.ts's assignInvoiceNumberIfNeeded). Links to
 * the existing print-friendly /invoice/[orderNumber] page rather than
 * attaching a PDF — no PDF-rendering capability exists in this codebase.
 */
export function OrderConfirmationEmail({
  customerName,
  orderNumber,
  items,
  deliveryDate,
  deliverySlotLabel,
  deliveryAddress,
  total,
  paymentMethod,
  walletAmountUsed = 0,
  invoiceUrl,
  storeAddressLine,
  storeCity,
  storePincode,
}: OrderConfirmationEmailProps) {
  const paymentLabel =
    paymentMethod === "WALLET"
      ? "Paid from wallet"
      : `${paymentMethod === "COD" ? "Cash on Delivery" : "Paid online"}${
          walletAmountUsed > 0 ? ` · ${formatINR(walletAmountUsed)} from wallet` : ""
        }`;

  return (
    <Html>
      <Head />
      <Preview>Order {orderNumber} confirmed — thank you!</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            Thank you, {customerName}!
          </Heading>
          <Text style={{ margin: "4px 0" }}>
            Your order <strong>{orderNumber}</strong> is confirmed.
          </Text>

          <Section style={{ margin: "20px 0" }}>
            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: index < items.length - 1 ? "1px solid #eee" : undefined,
                }}
              >
                <Text style={{ margin: 0, fontSize: "14px" }}>
                  {item.productTitle}
                  {item.variantLabel ? ` · ${item.variantLabel}` : ""} × {item.quantity}
                </Text>
                <Text style={{ margin: 0, fontSize: "14px" }}>{formatINR(item.lineTotal)}</Text>
              </div>
            ))}
          </Section>

          <Text style={{ margin: "4px 0", fontSize: "14px", fontWeight: "bold" }}>
            Total: {formatINR(total)} ({paymentLabel})
          </Text>

          <Section
            style={{
              margin: "20px 0",
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: "#f6f6f6",
            }}
          >
            <Text style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "bold" }}>
              Delivering {formatDate(deliveryDate)}
              {deliverySlotLabel ? ` · ${deliverySlotLabel}` : ""}
            </Text>
            <Text style={{ margin: 0, fontSize: "13px", color: "#666" }}>{deliveryAddress}</Text>
          </Section>

          <Text style={{ margin: "16px 0 4px", fontSize: "13px" }}>
            <Link href={invoiceUrl} style={{ color: "#c9105f" }}>
              View your invoice
            </Link>
          </Text>
          <Text style={{ margin: "4px 0 16px", fontSize: "13px" }}>
            Questions about this order?{" "}
            <Link
              href={`${siteConfig.contact.whatsappHref}?text=${encodeURIComponent(
                `Hi! I have a question about my order ${orderNumber}.`,
              )}`}
              style={{ color: "#25D366" }}
            >
              Chat with us on WhatsApp
            </Link>
          </Text>

          <EmailFooter addressLine={storeAddressLine} city={storeCity} pincode={storePincode} />
        </Container>
      </Body>
    </Html>
  );
}

export default OrderConfirmationEmail;
