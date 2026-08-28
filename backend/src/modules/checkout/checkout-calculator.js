export function calculateCheckout({ items, shipping = 0, discount = 0, tax = 0 }) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0
  );

  return {
    subtotal,
    discount: Number(discount),
    shipping: Number(shipping),
    tax: Number(tax),
    total: subtotal - Number(discount) + Number(shipping) + Number(tax)
  };
}
