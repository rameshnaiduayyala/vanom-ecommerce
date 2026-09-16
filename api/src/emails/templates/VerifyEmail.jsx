import React from "react";
import { Text } from "@react-email/components";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { Button } from "../components/Button.jsx";
import { EmailLayout } from "../components/EmailLayout.jsx";

export default function VerifyEmail({ verifyUrl }) {
  return <EmailLayout preview="Verify your Vanom email"><Header /><Text>Please verify your email address to activate your account.</Text><Button href={verifyUrl}>Verify email</Button><Footer /></EmailLayout>;
}
