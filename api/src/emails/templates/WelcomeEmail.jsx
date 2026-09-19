import React from "react";
import { Text } from "@react-email/components";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { EmailLayout } from "../components/EmailLayout.jsx";

export default function WelcomeEmail({ firstName = "there" }) {
  return <EmailLayout preview="Welcome to Vanom"><Header /><Text className="text-base">Hi {firstName}, welcome to Vanom!</Text><Text>We are happy to have you with us.</Text><Footer /></EmailLayout>;
}
