export const SUPPORTED_B2B_COUNTRIES = [
  { code: "US", currency: "USD", symbol: "$", name: "United States", flag: "🇺🇸" },
  { code: "CA", currency: "CAD", symbol: "CA$", name: "Canada", flag: "🇨🇦" }
];

export const DEFAULT_WEIGHT_VARIANTS = [
  {
    weight: 500,
    weightUnit: "g",
    label: "500g",
    skuSuffix: "500G",
    isActive: true,
    prices: {
      US: { countryCode: "US", currencyCode: "USD", unitPrice: 4.50 },
      CA: { countryCode: "CA", currencyCode: "CAD", unitPrice: 6.00 }
    }
  },
  {
    weight: 1,
    weightUnit: "kg",
    label: "1kg",
    skuSuffix: "1KG",
    isActive: true,
    prices: {
      US: { countryCode: "US", currencyCode: "USD", unitPrice: 8.00 },
      CA: { countryCode: "CA", currencyCode: "CAD", unitPrice: 10.50 }
    }
  },
  {
    weight: 2,
    weightUnit: "kg",
    label: "2kg",
    skuSuffix: "2KG",
    isActive: true,
    prices: {
      US: { countryCode: "US", currencyCode: "USD", unitPrice: 15.00 },
      CA: { countryCode: "CA", currencyCode: "CAD", unitPrice: 20.00 }
    }
  }
];

export const DEFAULT_BULK_FORM = {
  name: "",
  sku: "",
  description: "",
  categoryId: "",
  brand: "VANOM Wholesale",
  isActive: true,
  images: [
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
  ],
  variants: DEFAULT_WEIGHT_VARIANTS
};
