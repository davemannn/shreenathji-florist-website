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

interface AbandonedCartEmailItem {
  productTitle: string;
  variantLabel: string;
  productSlug: string;
  quantity: number;
  price: number;
}

interface AbandonedCartEmailProps {
  customerName: string;
  items: AbandonedCartEmailItem[];
  subtotal: number;
  siteUrl: string;
}

/**
 * Links each item to its own product page rather than trying to deep-link
 * back into a repopulated cart — the cart itself is client-side
 * (localStorage), not server-persisted, so there's no server-side cart
 * state to hand the customer back into. Re-adding a couple of items is a
 * small ask; it's still the highest-value CTA available here.
 */
export function AbandonedCartEmail({
  customerName,
  items,
  subtotal,
  siteUrl,
}: AbandonedCartEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You left something beautiful behind</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            Still thinking it over, {customerName}?
          </Heading>
          <Text style={{ margin: "4px 0" }}>
            You left these in your cart at Shreenathji Florist — they&rsquo;re still here whenever
            you&rsquo;re ready.
          </Text>

          <Section style={{ margin: "20px 0" }}>
            {items.map((item, index) => (
              <div
                key={`${item.productSlug}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: index < items.length - 1 ? "1px solid #eee" : undefined,
                }}
              >
                <Text style={{ margin: 0, fontSize: "14px" }}>
                  <Link
                    href={`${siteUrl}/shop/product/${item.productSlug}`}
                    style={{ color: "#c9105f" }}
                  >
                    {item.productTitle}
                  </Link>
                  {" · "}
                  {item.variantLabel} × {item.quantity}
                </Text>
                <Text style={{ margin: 0, fontSize: "14px" }}>
                  {formatINR(item.price * item.quantity)}
                </Text>
              </div>
            ))}
          </Section>

          <Text style={{ margin: "4px 0", fontSize: "14px", fontWeight: "bold" }}>
            Subtotal: {formatINR(subtotal)}
          </Text>

          <Section style={{ margin: "24px 0", textAlign: "center" }}>
            <Link
              href={`${siteUrl}/shop`}
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
              Continue Shopping
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default AbandonedCartEmail;
