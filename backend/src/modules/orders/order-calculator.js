export function calculateOrderTotal(items, shipping = 0, discount = 0) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0
  );
  const tax = items.reduce((sum, item) => sum + Number(item.taxAmount || 0), 0);

  return {
    subtotal,
    tax,
    shipping: Number(shipping),
    discount: Number(discount),
    total: subtotal + tax + Number(shipping) - Number(discount)
  };
}
