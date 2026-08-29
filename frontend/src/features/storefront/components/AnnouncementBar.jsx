import React, { useState, useEffect } from "react";
import { X, Truck, ShieldCheck, Globe2, Building2, Award } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    icon: Truck,
    label: "Freight",
    text: "Free pallet shipping on orders above $2,999 — Delivered to 30+ countries via verified logistics partners",
  },
  {
    icon: ShieldCheck,
    label: "Compliance",
    text: "PCI-DSS Level 1 · ISO 9001:2015 Certified · Multi-currency secure checkout with GST, VAT & US Nexus support",
  },
  {
    icon: Building2,
    label: "B2B Portal",
    text: "Wholesale accounts open — NET 30 credit terms, tiered pricing & dedicated procurement manager assigned",
  },
  {
    icon: Globe2,
    label: "Markets",
    text: "Serving buyers across United States & United Kingdom with localised pricing and customs documentation",
  },
  {
    icon: Award,
    label: "Dispatch SLA",
    text: "99.7% on-time dispatch · Same-day fulfilment on 500+ in-stock SKUs from certified warehouses",
  },
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const { icon: Icon, label, text } = ANNOUNCEMENTS[activeIdx];

  return (
    <div className="bg-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        {/* Left: Brand label */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <div className="w-1.5 h-3.5 rounded-full bg-slate-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Vanom
          </span>
        </div>

        {/* Center: Ticker message */}
        <div className="flex-1 flex items-center justify-center gap-2.5 text-center min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0 hidden md:inline">
            {label}
          </span>
          <div className="hidden md:block w-px h-3 bg-slate-700 shrink-0" />
          <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <p className="text-[11px] sm:text-xs font-medium tracking-wide truncate text-slate-300">
            {text}
          </p>
        </div>

        {/* Right: Dots + Close */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            {ANNOUNCEMENTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`rounded-full transition-all duration-400 ${
                  idx === activeIdx
                    ? "w-4 h-1 bg-slate-400"
                    : "w-1 h-1 bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded hover:bg-slate-800 transition-colors text-slate-600 hover:text-slate-300 cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
