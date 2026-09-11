import React from "react";
import { MapPin, Loader2 } from "lucide-react";
import { US_STATES, CA_PROVINCES } from "../../../constants/countries.js";

export function CartTaxEstimator({
  country,
  destination,
  setDestination,
  isCalculatingTax,
}) {
  return (
    <div className="border-t border-border pt-3">
      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
            <MapPin className="w-3.5 h-3.5 text-[#007185]" />
            <span>Estimated Tax by Destination</span>
          </div>
          {isCalculatingTax && (
            <span className="text-[10px] text-[#007185] font-medium flex items-center gap-1">
              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Calculating...
            </span>
          )}
        </div>

        {/* Country / Currency Info Bar (Synced with Header) */}
        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{country.code === "CA" ? "🇨🇦" : "🇺🇸"}</span>
            <div>
              <div className="font-bold text-gray-900">
                {country.code === "CA" ? "Canada" : "United States"}
              </div>
              <div className="text-[10px] text-gray-500">
                Active Currency: <span className="font-semibold text-gray-700">{country.currency} ({country.symbol})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Dynamic State / Province Selector Based on Header Selected Currency */}
          {country.code === "CA" ? (
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1">
                Canadian Province (GST/PST/HST)
              </label>
              <select
                value={destination.regionCode || "ON"}
                onChange={(e) => setDestination((prev) => ({ ...prev, regionCode: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs font-medium bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185]"
              >
                {CA_PROVINCES.map((pr) => (
                  <option key={pr.code} value={pr.code}>
                    {pr.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-700 mb-1">
                US State (Sales Tax)
              </label>
              <select
                value={destination.regionCode || "CA"}
                onChange={(e) => setDestination((prev) => ({ ...prev, regionCode: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs font-medium bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185]"
              >
                {US_STATES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Postal / Zip Code Input */}
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-gray-700 mb-1">
              {country.code === "CA" ? "Postal Code" : "ZIP Code"}
            </label>
            <input
              type="text"
              value={destination.postalCode}
              onChange={(e) => setDestination((prev) => ({ ...prev, postalCode: e.target.value }))}
              placeholder={country.code === "CA" ? "M5V 2T6" : "90210"}
              className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
          <span>Avalara AvaTax / Stripe Tax Matrix</span>
          <span className="text-[#067d62] font-semibold">Live Real-Time Rates</span>
        </div>
      </div>
    </div>
  );
}
