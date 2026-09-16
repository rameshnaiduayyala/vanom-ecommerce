import React from "react";
import { Body, Container, Head, Html, Preview } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

export function EmailLayout({ preview, children }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans text-gray-900">
          <Container className="mx-auto my-0 max-w-xl bg-white p-8">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
