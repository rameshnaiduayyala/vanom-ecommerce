/**
 * AnnouncementBar.jsx
 * Top-of-page announcement bar rendered ABOVE the header in PublicLayout.
 * Matches reference: delivery pin | rotating promos | track/help/sell/sign-in links
 */
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, ChevronDown, X } from "lucide-react";
import { useCountryStore } from "../../../stores/country.store.js";
import { SUPPORTED_COUNTRIES } from "../../../constants/countries.js";

const PROMO_MESSAGES = [
  "Free shipping on orders above ₹999",
  "Use code VANOM10 for 10% off your first order",
  "Now delivering to 30+ countries worldwide",
  "Best Prices Guaranteed • Genuine Brands • Easy Returns",
];

export function AnnouncementBar() {
  const { country, setCountry } = useCountryStore();
  const [visible, setVisible] = useState(true);
  const [showCurrency, setShowCurrency] = useState(false);
  const currencyRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) setShowCurrency(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full bg-[#2d6852] text-white select-none z-50">
      <div
        className="max-w-[1400px] mx-auto px-3 sm:px-6 h-8 flex items-center justify-between gap-2"
        style={{ fontSize: "11px" }}
      >

        {/* ── LEFT: Delivery location ── */}
        {/* <div className="flex items-center gap-1 shrink-0">
          <MapPin className="w-3 h-3 text-[#D9A514]"  />
          <span className="text-white/70 hidden sm:inline">Deliver to:</span>
          <span className="text-white font-semibold">
            {country.name}&nbsp;{country.code}
          </span>
        </div> */}

        {/* ── CENTER: Scrolling Marquee Announcements ── */}
        <div className="flex-1 overflow-hidden relative mx-2 sm:mx-6 flex items-center min-w-0 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]">
          <div className="animate-marquee flex items-center gap-8 text-white/90 font-medium">
            {[...PROMO_MESSAGES, ...PROMO_MESSAGES].map((msg, idx) => (
              <span key={idx} className="flex items-center gap-3 shrink-0 cursor-pointer hover:text-[#D9A514]">
                <span>{msg}</span>
                <span className="text-[#D9A514]">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Nav links + currency ── */}
        <div className="flex items-center gap-0 shrink-0">

          {/* Currency / Country selector */}
          <div className="relative flex items-center h-8" ref={currencyRef}>
            <button
              onClick={() => setShowCurrency((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 h-8 text-white/80 hover:text-white hover:bg-white/10 transition-colors border-r border-white/10 cursor-pointer"
              title="Change Country & Currency"
            >
              {/* Circular flag image */}
              <img
                src={country.flagUrl || `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                alt={country.name}
                className="w-4 h-4 rounded-full object-cover border border-white/20 shrink-0"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "inline"; }}
              />
              <span className="hidden" style={{ display: "none" }}>{country.flag}</span>
              <span className="font-semibold text-[11px]">{country.code}</span>
              <span className="hidden sm:inline text-white/60 text-[10px]">{country.currency}</span>
              <ChevronDown className={`w-3 h-3 text-white/60 transition-transform duration-200 ${showCurrency ? "rotate-180" : ""}`} />
            </button>

            {showCurrency && (
              <div className="absolute right-0 top-full mt-0.5 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-[200] overflow-hidden">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  Select Country
                </div>
                {SUPPORTED_COUNTRIES.map((c) => {
                  const isSelected = c.code === country.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => { setCountry(c); setShowCurrency(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-[#EAF7F0] transition-colors cursor-pointer ${isSelected ? "bg-[#EAF7F0] text-[#003D2B] font-bold" : "text-gray-700"
                        }`}
                    >
                      {/* Circular flag image in dropdown */}
                      <img
                        src={c.flagUrl || `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                        alt={c.name}
                        className="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0"
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "inline"; }}
                      />
                      <span className="hidden" style={{ display: "none" }}>{c.flag}</span>
                      <span className="flex-1 text-left">{c.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-[#006B3C] text-white" : "bg-gray-100 text-gray-500"}`}>
                        {c.symbol} {c.currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* For Bussiness */}
          <Link
            to="/bulk-buyers"
            className="hidden sm:flex items-center px-2.5 h-8 text-white/75 hover:text-white hover:bg-white/10 transition-colors border-r border-white/10 whitespace-nowrap"
          >
            For Bussiness
          </Link>

          {/* Dismiss */}
          <button
            onClick={() => setVisible(false)}
            className="flex items-center px-2 h-8 text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
