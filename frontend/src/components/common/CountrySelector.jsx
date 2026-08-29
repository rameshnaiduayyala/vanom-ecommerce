import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useCountryStore } from "../../stores/country.store.js";
import { SUPPORTED_COUNTRIES } from "../../constants/countries.js";

function FlagIcon({ code, className = "w-4 h-3 rounded-xs shrink-0 object-cover" }) {
  if (code === "GB") {
    return (
      <svg className={className} viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <clipPath id="gb-clip-common"><rect width="60" height="40" rx="2" fill="white"/></clipPath>
        <g clipPath="url(#gb-clip-common)">
          <rect width="60" height="40" fill="#012169"/>
          <path d="M0 0L60 40M60 0L0 40" stroke="white" strokeWidth="6"/>
          <path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" strokeWidth="3.5"/>
          <path d="M30 0V40M0 20H60" stroke="white" strokeWidth="10"/>
          <path d="M30 0V40M0 20H60" stroke="#C8102E" strokeWidth="6"/>
        </g>
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <clipPath id="us-clip-common"><rect width="60" height="40" rx="2" fill="white"/></clipPath>
      <g clipPath="url(#us-clip-common)">
        <rect width="60" height="40" fill="#B22234"/>
        <path d="M0 6.15H60M0 12.3H60M0 18.45H60M0 24.6H60M0 30.75H60M0 36.9H60" stroke="white" strokeWidth="3.08"/>
        <rect width="25" height="21.5" fill="#3C3B6E"/>
      </g>
    </svg>
  );
}

/**
 * Enterprise Minimal CountrySelector component
 */
export function CountrySelector({ className = "", variant = "dropdown" }) {
  const { country, setCountry } = useCountryStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activeCode = country?.code || "US";

  if (variant === "select") {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <select
          value={activeCode}
          onChange={(e) => {
            const found = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
            if (found) setCountry(found);
          }}
          className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-slate-400 focus:outline-none cursor-pointer"
          aria-label="Select Country"
        >
          {SUPPORTED_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.symbol} {c.currency})
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 shadow-xs transition-all cursor-pointer"
      >
        <FlagIcon code={activeCode} />
        <span>{country?.name || "United States"}</span>
        <span className="text-slate-400 font-mono">({country?.currency || "USD"})</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-1.5 left-0 sm:right-0 sm:left-auto w-52 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-50 animate-in fade-in duration-100">
          <div className="space-y-0.5">
            {SUPPORTED_COUNTRIES.map((c) => {
              const isSelected = c.code === activeCode;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCountry(c);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-slate-100 text-slate-950 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FlagIcon code={c.code} className="w-5 h-3.5 rounded-xs" />
                    <div>
                      <div className="font-semibold leading-none">{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{c.currency} ({c.symbol})</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CountrySelector;
