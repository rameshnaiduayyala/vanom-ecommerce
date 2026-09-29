import React from "react";
import { Text, Section, Heading, Hr } from "@react-email/components";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { Button } from "../components/Button.jsx";
import { EmailLayout } from "../components/EmailLayout.jsx";

export default function VerifyEmail({
  verifyUrl,
  firstName,
  businessName,
  businessEmail,
  businessPhone,
  taxRegistrationNumber,
  registrationNumber,
  address,
  isB2B,
}) {
  const greeting = firstName ? `Hello ${firstName},` : "Hello,";

  return (
    <EmailLayout preview={isB2B ? `Verify your Vanom B2B Wholesale account - ${businessName || "Business"}` : "Verify your Vanom account"}>
      <Header />

      <Section style={{ padding: "0 32px 32px 32px" }}>
        <Heading style={{ fontSize: "24px", fontWeight: "bold", color: "#0F2B1C", marginBottom: "16px" }}>
          {isB2B ? "Welcome to Vanom Wholesale!" : "Welcome to Vanom!"}
        </Heading>

        <Text style={{ fontSize: "15px", color: "#2D3748", lineHeight: "24px" }}>
          {greeting}
        </Text>

        <Text style={{ fontSize: "15px", color: "#2D3748", lineHeight: "24px" }}>
          Thank you for registering {isB2B ? "your business on Vanom Wholesale" : "an account on Vanom"}.
          Please click the button below to verify your email address and activate your account.
        </Text>

        {isB2B && businessName && (
          <Section style={{ marginTop: "20px", marginBottom: "24px", padding: "16px 20px", backgroundColor: "#F7FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <Text style={{ fontSize: "13px", fontWeight: "bold", color: "#2B6CB0", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px 0" }}>
              Registered Business Profile Details
            </Text>

            <table style={{ width: "100%", fontSize: "13px", color: "#4A5568", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "600", width: "40%" }}>Business Name:</td>
                  <td style={{ padding: "4px 0", color: "#1A202C", fontWeight: "bold" }}>{businessName}</td>
                </tr>
                {businessEmail && (
                  <tr>
                    <td style={{ padding: "4px 0", fontWeight: "600" }}>Business Email:</td>
                    <td style={{ padding: "4px 0" }}>{businessEmail}</td>
                  </tr>
                )}
                {businessPhone && (
                  <tr>
                    <td style={{ padding: "4px 0", fontWeight: "600" }}>Business Phone:</td>
                    <td style={{ padding: "4px 0" }}>{businessPhone}</td>
                  </tr>
                )}
                {taxRegistrationNumber && (
                  <tr>
                    <td style={{ padding: "4px 0", fontWeight: "600" }}>Tax ID / GSTIN / EIN:</td>
                    <td style={{ padding: "4px 0", fontFamily: "monospace" }}>{taxRegistrationNumber}</td>
                  </tr>
                )}
                {registrationNumber && (
                  <tr>
                    <td style={{ padding: "4px 0", fontWeight: "600" }}>Registration No:</td>
                    <td style={{ padding: "4px 0", fontFamily: "monospace" }}>{registrationNumber}</td>
                  </tr>
                )}
                {address && (
                  <tr>
                    <td style={{ padding: "4px 0", fontWeight: "600" }}>Business Address:</td>
                    <td style={{ padding: "4px 0" }}>{address}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>
        )}

        <Section style={{ textAlign: "center", marginTop: "28px", marginBottom: "28px" }}>
          <Button href={verifyUrl}>
            Verify Email Address
          </Button>
        </Section>

        <Text style={{ fontSize: "13px", color: "#718096", lineHeight: "20px" }}>
          If you did not request this registration, you can safely ignore this email.
        </Text>
      </Section>

      <Footer />
    </EmailLayout>
  );
}
