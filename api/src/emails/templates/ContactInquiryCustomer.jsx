import React from "react";
import {
  Text,
  Heading,
  Section,
  Hr,
} from "@react-email/components";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { EmailLayout } from "../components/EmailLayout.jsx";

export default function ContactInquiryCustomer({
  name = "there",
  subject = "Your inquiry",
  message = "",
  storeName = "Vanom",
}) {
  return (
    <EmailLayout preview={`Thank you for contacting ${storeName}`}>
      <Header />
      <Section className="px-8 py-4">
        <Heading as="h2" className="text-xl font-bold text-[#0B4627] m-0 mb-3">
          We&apos;ve Received Your Message!
        </Heading>
        <Text className="text-sm text-gray-700 leading-relaxed mb-4">
          Hi <strong>{name}</strong>,
        </Text>
        <Text className="text-sm text-gray-700 leading-relaxed mb-6">
          Thank you for reaching out to <strong>{storeName}</strong>. We have successfully logged your inquiry regarding <strong>&ldquo;{subject}&rdquo;</strong>. Our dedicated customer care team is reviewing it and will respond within 24 business hours.
        </Text>

        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Your Submitted Message:
        </Text>
        <Section className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#0B4627] border-gray-200 border-t border-r border-b mb-6">
          <Text className="text-sm text-gray-700 italic m-0 leading-relaxed whitespace-pre-wrap">
            &ldquo;{message}&rdquo;
          </Text>
        </Section>

        <Text className="text-sm text-gray-700 leading-relaxed m-0">
          Warm regards,
          <br />
          <strong>The {storeName} Customer Support Team</strong>
        </Text>
      </Section>
      <Hr className="border-gray-200 my-4" />
      <Footer />
    </EmailLayout>
  );
}
