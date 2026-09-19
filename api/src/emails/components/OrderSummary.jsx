import React from "react";
import { Section, Text } from "@react-email/components";

export function OrderSummary({ items = [], currencyCode = "", total = "" }) {
  return <Section className="my-6 rounded-md border border-solid border-gray-200 p-4">{items.map((item) => <Text className="my-2 text-sm" key={item.id || item.sku || item.productName}>{item.productName} × {item.quantity} — {currencyCode} {item.total}</Text>)}<Text className="font-bold">Total: {currencyCode} {total}</Text></Section>;
}
