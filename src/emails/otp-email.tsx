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

export type OtpEmailPurpose = "email-verification" | "forget-password";

interface OtpEmailProps {
  otp: string;
  purpose: OtpEmailPurpose;
}

const COPY: Record<OtpEmailPurpose, { preview: string; heading: string; body: string }> = {
  "email-verification": {
    preview: "Verify your email for Shreenathji Florist",
    heading: "Verify your email address",
    body: "Enter this code to confirm your email and finish setting up your account.",
  },
  "forget-password": {
    preview: "Reset your Shreenathji Florist password",
    heading: "Reset your password",
    body: "Enter this code to choose a new password. If you didn't request this, you can safely ignore this email.",
  },
};

/** Shared template for both email-verification and forget-password OTP sends — see server/auth/config.ts's `emailOTP` plugin, the only caller. */
export function OtpEmail({ otp, purpose }: OtpEmailProps) {
  const copy = COPY[purpose];

  return (
    <Html>
      <Head />
      <Preview>{copy.preview}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading as="h2" style={{ fontSize: "18px" }}>
            {copy.heading}
          </Heading>
          <Text style={{ margin: "4px 0" }}>{copy.body}</Text>
          <Section
            style={{
              margin: "20px 0",
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: "#c9105f",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            <Text style={{ margin: 0, fontSize: "32px", fontWeight: "bold", letterSpacing: "8px" }}>
              {otp}
            </Text>
          </Section>
          <Text style={{ margin: "16px 0 4px", fontSize: "13px", color: "#666" }}>
            This code expires in 5 minutes. Never share it with anyone — Shreenathji Florist staff
            will never ask you for it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OtpEmail;
