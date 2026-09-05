import React, { useState, useRef, useEffect } from "react";
import { Mail, Phone, ChevronDown } from "lucide-react";
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
    <div className="bg-[#0B3B24] text-emerald-100/80 text-[11px] border-b border-emerald-900/40 select-none relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
        {/* Left: Brand motto matching PlantX */}
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
          <span className="font-bold text-white tracking-wide text-[11px]">VANOM GLOBAL</span>
          <span className="w-1 h-1 rounded-full bg-emerald-400/50 hidden sm:block" />
          <span className="text-emerald-100/70 font-medium hidden sm:inline">
            Global Retail. Commercial Supplies. Worldwide.
          </span>
        </div>

        {/* Right: Contact & Currency */}
        <div className="flex items-center gap-5">
          <a
            href="mailto:ayyalarameshnaidu@gmail.com"
            className="hidden md:flex items-center gap-1.5 text-emerald-100/80 hover:text-white transition-colors"
          >
            <Mail className="w-3 h-3 text-[#4ADE80]" />
            <span>ayyalarameshnaidu@gmail.com</span>
          </a>

          <div className="hidden sm:block w-px h-3 bg-emerald-800/60" />

          <a
            href="tel:+917989419864"
            className="flex items-center gap-1.5 text-emerald-100/80 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-[#4ADE80]" />
            <span>+91 7989419864</span>
          </a>

          <div className="w-px h-3 bg-emerald-800/60" />

          {/* Currency Selector */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 text-emerald-100/90 hover:text-white transition-all cursor-pointer"
              title="Change Currency & Market"
            >
              <span className="text-xs leading-none">{country.flag}</span>
              <span className="font-semibold text-[11px] text-white">{country.code}</span>
              <span className="text-emerald-200/70">({country.symbol})</span>
              <ChevronDown className={`w-3 h-3 text-emerald-200/70 transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-emerald-100 shadow-2xl py-1 text-slate-800 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Currency & Market
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
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F6FAF7] transition-colors cursor-pointer ${isSelected ? "bg-[#F6FAF7] text-[#00875A] font-semibold" : "text-slate-600"
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {c.symbol}
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
