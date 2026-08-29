import React, { useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useCountryStore } from "../../../stores/country.store.js";
import { SUPPORTED_COUNTRIES } from "../../../constants/countries.js";

// Clean vector flags that render perfectly across all OS (including Windows)
function FlagIcon({ code, className = "w-4 h-3 rounded-xs shadow-2xs shrink-0 object-cover" }) {
  if (code === "GB") {
    return (
      <svg className={className} viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <clipPath id="gb-clip"><rect width="60" height="40" rx="2" fill="white"/></clipPath>
        <g clipPath="url(#gb-clip)">
          <rect width="60" height="40" fill="#012169"/>
          <path d="M0 0L60 40M60 0L0 40" stroke="white" strokeWidth="6"/>
          <path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" strokeWidth="3.5"/>
          <path d="M30 0V40M0 20H60" stroke="white" strokeWidth="10"/>
          <path d="M30 0V40M0 20H60" stroke="#C8102E" strokeWidth="6"/>
        </g>
      </svg>
    );
  }

  // Default: US Flag
  return (
    <svg className={className} viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <clipPath id="us-clip"><rect width="60" height="40" rx="2" fill="white"/></clipPath>
      <g clipPath="url(#us-clip)">
        <rect width="60" height="40" fill="#B22234"/>
        <path d="M0 6.15H60M0 12.3H60M0 18.45H60M0 24.6H60M0 30.75H60M0 36.9H60" stroke="white" strokeWidth="3.08"/>
        <rect width="25" height="21.5" fill="#3C3B6E"/>
      </g>
    </svg>
  );
}

export function HeaderCountryDropdown({ isOpen, onToggle, onClose }) {
  const { country, setCountry } = useCountryStore();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const activeCode = country?.code || "US";

  return (
    <div ref={containerRef} className="relative">
      {/* Enterprise Minimal Trigger */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
          isOpen
            ? "bg-slate-50 border-slate-400 shadow-xs"
            : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
        }`}
        aria-label="Select Country and Currency"
      >
        <FlagIcon code={activeCode} />
        <span className="font-bold tracking-tight text-slate-900">{activeCode}</span>
        <span className="text-slate-400 font-mono text-[11px]">({country?.currency || "USD"})</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-slate-700" : ""
          }`}
        />
      </button>

      {/* Enterprise Compact Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-50 animate-in fade-in duration-100">
          <div className="space-y-0.5">
            {SUPPORTED_COUNTRIES.map((c) => {
              const isActive = c.code === activeCode;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    setCountry(c);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isActive
                      ? "bg-slate-100 text-slate-950 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FlagIcon code={c.code} className="w-5 h-3.5 rounded-xs" />
                    <div>
                      <div className="font-semibold leading-none">{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {c.currency} ({c.symbol})
                      </div>
                    </div>
                  </div>

                  {isActive && <Check className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default HeaderCountryDropdown;
