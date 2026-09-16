import React from "react";
import { Text } from "@react-email/components";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { Button } from "../components/Button.jsx";
import { EmailLayout } from "../components/EmailLayout.jsx";

export default function PasswordReset({ resetUrl, expiresInMinutes }) {
  return <EmailLayout preview="Reset your Vanom password"><Header /><Text>We received a request to reset your password.</Text><Button href={resetUrl}>Reset password</Button><Text>This link expires in {expiresInMinutes} minutes.</Text><Footer /></EmailLayout>;
}
