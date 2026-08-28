import { createContext, useContext, useState } from "react";

const RegionContext = createContext(null);

const regions = {
  IN: { name: "India", currency: "INR", locale: "en-IN" },
  US: { name: "United States", currency: "USD", locale: "en-US" },
  GB: { name: "United Kingdom", currency: "GBP", locale: "en-GB" }
};

export function RegionProvider({ children }) {
  const [country, setCountry] = useState("IN");
  const region = regions[country];

  const formatPrice = amount =>
    new Intl.NumberFormat(region.locale, {
      style: "currency",
      currency: region.currency
    }).format(Number(amount));

  return (
    <RegionContext.Provider value={{ country, setCountry, region, regions, formatPrice }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  return useContext(RegionContext);
}
