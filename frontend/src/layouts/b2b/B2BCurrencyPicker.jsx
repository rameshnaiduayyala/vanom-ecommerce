import React from "react";
import { useCountryStore } from "@/stores/country.store.js";
import { SUPPORTED_COUNTRIES } from "@/constants/countries.js";

export function B2BCurrencyPicker({ className = "" }) {
  const { country, setCountry } = useCountryStore();

  return (
    <div
      className={`flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs ${className}`}
    >
      <span className="text-sm leading-none">{country.flag}</span>
      <select
        value={country.code}
        onChange={(e) => {
          const found = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
          if (found) setCountry(found);
        }}
        className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer text-xs"
        aria-label="Select Country & Currency"
      >
        {SUPPORTED_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code} className="bg-white text-slate-800">
            {c.code} ({c.currency})
          </option>
        ))}
      </select>
    </div>
  );
}

export default B2BCurrencyPicker;
