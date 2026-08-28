export function validateMinimumQuantity(quantity, moq) {
  if (Number(quantity) < Number(moq)) {
    throw new Error(`Minimum order quantity is ${moq}`);
  }
  return true;
}
