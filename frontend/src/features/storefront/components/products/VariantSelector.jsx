import React from "react";
import { formatPrice } from "@/utils/formatters.js";

export function VariantSelector({
  variants = [],
  selectedVariantId,
  onSelectVariant,
  country = { code: "US", currency: "USD", symbol: "$" },
  baseFallbackPrice = 0,
}) {
  if (!variants || variants.length === 0) return null;

  const selectedVariantObj =
    variants.find((v) => v.id === selectedVariantId) || variants[0];

  return (
    <div className="pt-2 pb-1 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800">
          Select Option / Size:
        </span>
        <span className="text-[11px] font-semibold text-emerald-700">
          {selectedVariantObj
            ? selectedVariantObj.variant_name || selectedVariantObj.name
            : "Standard"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = (selectedVariantObj?.id || variants[0]?.id) === v.id;

          // Resolve variant price for active country
          const vCountryEntry = Array.isArray(v.countries)
            ? v.countries.find(
                (c) =>
                  c.country?.code === country.code ||
                  c.currency === country.currency ||
                  c.country?.name?.toLowerCase() === country.name?.toLowerCase() ||
                  (country.code === "US" && (c.currency === "USD" || c.country?.code === "US")) ||
                  (country.code === "CA" && (c.currency === "CAD" || c.country?.code === "CA"))
              ) || v.countries[0]
            : null;

          const vPrice =
            country.code === "CA"
              ? vCountryEntry?.price ??
                v.price_cad ??
                (vCountryEntry?.price
                  ? Number(vCountryEntry.price) * 1.35
                  : v.price_usd
                  ? Number(v.price_usd) * 1.35
                  : baseFallbackPrice
                  ? Number(baseFallbackPrice) * 1.35
                  : 0)
              : vCountryEntry?.price ??
                v.price_usd ??
                v.price ??
                baseFallbackPrice ??
                0;

          const vStock = vCountryEntry?.stock ?? v.stock_quantity ?? v.stock ?? 0;

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVariant(v.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-start gap-0.5 ${
                isSelected
                  ? "bg-emerald-50/80 border-[#003D2B] text-[#003D2B] ring-2 ring-[#003D2B]/20"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              <span>{v.variant_name || v.name}</span>
              <span className="text-[10px] font-normal text-gray-500">
                {formatPrice(vPrice, country.currency, country.symbol)}{" "}
                {vStock > 0 ? `• ${vStock} left` : "• Out of stock"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VariantSelector;
