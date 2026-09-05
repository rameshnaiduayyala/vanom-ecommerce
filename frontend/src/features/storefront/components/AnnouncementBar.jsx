import React, { useState, useRef, useEffect } from "react";
import { Mail, Phone, Globe, ChevronDown } from "lucide-react";
import { useCountryStore } from "../../../stores/country.store.js";
import { SUPPORTED_COUNTRIES } from "../../../constants/countries.js";

export function AnnouncementBar() {
  const { country, setCountry } = useCountryStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-[#042A19] text-[#A7F3D0] text-xs border-b border-emerald-900/40 select-none relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        {/* Left: Brand motto */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold text-white tracking-wide">VANOM GLOBAL</span>
          <span className="text-emerald-400/60 hidden sm:inline">•</span>
          <span className="text-emerald-300/90 text-[11px] sm:text-xs hidden sm:inline">
            Global B2C Retail & B2B Wholesale Enterprise
          </span>
        </div>

        {/* Right: Direct Contact & Language & Currency */}
        <div className="flex items-center gap-4 text-[11px] sm:text-xs">
          <a
            href="mailto:ayyalarameshnaidu@gmail.com"
            className="hidden md:flex items-center gap-1.5 text-emerald-200/80 hover:text-white transition-colors"
          >
            <Mail className="w-3 h-3 text-[#10B981]" />
            <span>ayyalarameshnaidu@gmail.com</span>
          </a>

          <a
            href="tel:+917989419864"
            className="flex items-center gap-1.5 text-emerald-200/80 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-[#10B981]" />
            <span>+91 7989419864</span>
          </a>

          {/* Interactive Country / Currency Selector */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/50 text-emerald-100 transition-all cursor-pointer shadow-xs"
              title="Change Currency & Market Jurisdiction"
            >
              <span className="text-sm leading-none">{country.flag}</span>
              <span className="font-bold text-[11px] text-white">{country.code}</span>
              <span className="text-[10px] text-emerald-300">({country.currency} {country.symbol})</span>
              <ChevronDown className={`w-3 h-3 text-emerald-300 transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl border border-[#DCE8DF] shadow-2xl py-1 text-slate-800 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Currency & Market
                </div>
                {SUPPORTED_COUNTRIES.map((c) => {
                  const isSelected = c.code === country.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCountry(c);
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 hover:text-[#074428] transition-colors cursor-pointer ${isSelected ? "bg-emerald-50 text-[#074428] font-bold" : "text-slate-700"
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <span className="font-semibold">{c.name}</span>
                      </span>
                      <span className="font-bold text-[#074428] font-mono text-xs">
                        {c.currency} ({c.symbol})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

