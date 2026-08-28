export function calculateTax({ taxableAmount, rate = 0, currency, taxType = "NONE" }) {
  const taxable = Number(taxableAmount);
  const taxAmount = taxable * (Number(rate) / 100);

  return {
    taxableAmount: taxable,
    rate: Number(rate),
    taxAmount,
    totalAmount: taxable + taxAmount,
    currency,
    taxType
  };
}
