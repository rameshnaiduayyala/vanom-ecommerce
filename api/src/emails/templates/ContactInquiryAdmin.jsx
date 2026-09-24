import React from "react";
import {
  Text,
  Heading,
  Section,
  Row,
  Column,
  Hr,
  Link,
} from "@react-email/components";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { EmailLayout } from "../components/EmailLayout.jsx";
import { env } from "../../config/env.js";

export default function ContactInquiryAdmin({
  name = "Customer",
  email = "customer@example.com",
  phone = null,
  subject = "General Inquiry",
  message = "",
  storeName = "Vanom",
}) {
  const adminPortalUrl = `${(env.clientUrl || "http://localhost:5173").replace(/\/$/, "")}/admin/messages`;

  return (
    <EmailLayout preview={`New Customer Inquiry: ${subject} from ${name}`}>
      <Header />
      <Section className="px-8 py-4">
        <Heading as="h2" className="text-xl font-bold text-[#0B4627] m-0 mb-1">
          New Customer Inquiry
        </Heading>
        <Text className="text-xs text-gray-500 m-0 mb-6">
          Received via {storeName} Storefront Contact Form
        </Text>

        <Section className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <Row className="mb-2">
            <Column className="w-28 text-xs font-bold text-gray-500 uppercase">Customer:</Column>
            <Column className="text-sm font-semibold text-gray-900">{name}</Column>
          </Row>
          <Row className="mb-2">
            <Column className="w-28 text-xs font-bold text-gray-500 uppercase">Email:</Column>
            <Column className="text-sm text-[#0B4627]">
              <Link href={`mailto:${email}`} className="text-[#0B4627] font-semibold underline">
                {email}
              </Link>
            </Column>
          </Row>
          {phone && (
            <Row className="mb-2">
              <Column className="w-28 text-xs font-bold text-gray-500 uppercase">Phone:</Column>
              <Column className="text-sm text-gray-900 font-mono">{phone}</Column>
            </Row>
          )}
          <Row>
            <Column className="w-28 text-xs font-bold text-gray-500 uppercase">Subject:</Column>
            <Column className="text-sm font-semibold text-gray-900">{subject}</Column>
          </Row>
        </Section>

        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Customer Message:
        </Text>
        <Section className="bg-white p-4 rounded-lg border-l-4 border-[#0B4627] border-gray-200 border-t border-r border-b mb-6">
          <Text className="text-sm text-gray-800 m-0 leading-relaxed whitespace-pre-wrap">
            {message}
          </Text>
        </Section>

        <Section className="text-center my-6">
          <Link
            href={adminPortalUrl}
            className="inline-block bg-[#0B4627] text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center no-underline"
          >
            Manage in Admin Portal
          </Link>
        </Section>
      </Section>
      <Hr className="border-gray-200 my-4" />
      <Footer />
    </EmailLayout>
  );
}
