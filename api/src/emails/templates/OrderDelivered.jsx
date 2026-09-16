import React from "react";
import { Text } from "@react-email/components";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { EmailLayout } from "../components/EmailLayout.jsx";

export default function OrderDelivered({ orderId }) {
  return <EmailLayout preview="Your Vanom order was delivered"><Header /><Text>Your order {orderId} has been delivered.</Text><Text>Thank you for shopping with Vanom.</Text><Footer /></EmailLayout>;
}
