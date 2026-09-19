import React from "react";
import { Text } from "@react-email/components";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { OrderSummary } from "../components/OrderSummary.jsx";
import { EmailLayout } from "../components/EmailLayout.jsx";

export default function OrderConfirmation({ order }) {
  return <EmailLayout preview="Your Vanom order is confirmed"><Header /><Text>Thank you for your order.</Text><Text>Order ID: {order.id}</Text><OrderSummary items={order.items} currencyCode={order.currencyCode} total={order.total} /><Footer /></EmailLayout>;
}
