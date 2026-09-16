import React from "react";
import { Text } from "@react-email/components";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { EmailLayout } from "../components/EmailLayout.jsx";

export default function OrderShipped({ orderId, trackingUrl }) {
  return <EmailLayout preview="Your Vanom order has shipped"><Header /><Text>Your order {orderId} is on its way.</Text>{trackingUrl && <Text><a href={trackingUrl}>Track your shipment</a></Text>}<Footer /></EmailLayout>;
}
