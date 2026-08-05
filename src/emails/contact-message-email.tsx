import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ContactMessageEmailProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/** Sent to the store inbox whenever someone submits the /contact form. */
export function ContactMessageEmail({ name, email, phone, message }: ContactMessageEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New message from {name} via the website contact form</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            New Contact Form Message
          </Heading>
          <Section>
            <Text style={{ margin: "4px 0" }}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={{ margin: "4px 0" }}>
              <strong>Email:</strong> {email}
            </Text>
            {phone ? (
              <Text style={{ margin: "4px 0" }}>
                <strong>Phone:</strong> {phone}
              </Text>
            ) : null}
            <Text style={{ margin: "16px 0 4px", whiteSpace: "pre-wrap" }}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactMessageEmail;
