export const countries = {
  IN: { name: "India", currency: "INR", locale: "en-IN" },
  US: { name: "United States", currency: "USD", locale: "en-US" },
  GB: { name: "United Kingdom", currency: "GBP", locale: "en-GB" }
};

export function resolveRegion(countryCode = "IN") {
  return countries[countryCode] || countries.IN;
}
