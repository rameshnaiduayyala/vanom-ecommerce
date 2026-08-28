export function resolveRegionalPrice(prices, {
  countryCode,
  customerGroup = "RETAIL",
  quantity = 1
}) {
  const candidates = prices
    .filter(p =>
      p.countryCode === countryCode &&
      p.customerGroup === customerGroup &&
      p.active !== false &&
      quantity >= Number(p.minQuantity || 1) &&
      (!p.maxQuantity || quantity <= Number(p.maxQuantity))
    )
    .sort((a, b) => Number(b.minQuantity || 1) - Number(a.minQuantity || 1));

  if (!candidates.length) throw new Error("No price available");
  return candidates[0];
}
