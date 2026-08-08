import { Body, Container, Heading, Head, Html, Link, Preview, Text } from "@react-email/components";
import { EmailFooter } from "./components/email-footer";

export type OrderStatusEmailStatus = "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

interface OrderStatusEmailProps {
  customerName: string;
  orderNumber: string;
  status: OrderStatusEmailStatus;
  trackOrderUrl: string;
  storeAddressLine?: string;
  storeCity?: string;
  storePincode?: string;
}

const COPY: Record<OrderStatusEmailStatus, { preview: string; heading: string; body: string }> = {
  OUT_FOR_DELIVERY: {
    preview: "Your order is out for delivery",
    heading: "On its way!",
    body: "Your order is out for delivery and should arrive soon.",
  },
  DELIVERED: {
    preview: "Your order has been delivered",
    heading: "Delivered — enjoy!",
    body: "Your order has been delivered. We hope it made someone's day a little brighter. Thank you for shopping with us.",
  },
  CANCELLED: {
    preview: "Your order has been cancelled",
    heading: "Order cancelled",
    body: "Your order has been cancelled. If you didn't request this or have questions, just reply to this email.",
  },
};

/** One template, three copy variants — gated to only these three transitions in features/order/actions.ts's updateOrderStatusAction (PROCESSING isn't customer-meaningful enough to email about). */
export function OrderStatusEmail({
  customerName,
  orderNumber,
  status,
  trackOrderUrl,
  storeAddressLine,
  storeCity,
  storePincode,
}: OrderStatusEmailProps) {
  const copy = COPY[status];

  return (
    <Html>
      <Head />
      <Preview>{copy.preview}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            {copy.heading}
          </Heading>
          <Text style={{ margin: "4px 0" }}>
            Hi {customerName}, {copy.body}
          </Text>
          <Text style={{ margin: "16px 0 4px", fontSize: "13px" }}>
            Order <strong>{orderNumber}</strong> —{" "}
            <Link href={trackOrderUrl} style={{ color: "#c9105f" }}>
              view details
            </Link>
          </Text>

          <EmailFooter addressLine={storeAddressLine} city={storeCity} pincode={storePincode} />
        </Container>
      </Body>
    </Html>
  );
}

export default OrderStatusEmail;
