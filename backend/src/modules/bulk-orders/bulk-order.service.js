export function validateBulkOrder({ quantity, moq }) {
  if (Number(quantity) < Number(moq)) {
    throw new Error(`Bulk order MOQ is ${moq}`);
  }
  return { valid: true, quantity: Number(quantity), moq: Number(moq) };
}
