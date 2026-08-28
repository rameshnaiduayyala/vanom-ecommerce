import React, { useState, useEffect } from "react";
import { X, Truck, Zap, ShieldCheck, Globe2 } from "lucide-react";

const ANNOUNCEMENTS = [
  { icon: Truck, text: "Free shipping on orders above ₹2,999 / $49 / £39 — Delivered to 30+ countries" },
  { icon: Zap, text: "⚡ Flash Sale: Use code VANOM20 for 20% off bulk packaging & FMCG orders" },
  { icon: ShieldCheck, text: "🔒 PCI-DSS Level 1 Certified • ISO 9001:2015 Verified • Multi-currency secure checkout" },
  { icon: Globe2, text: "🌍 B2B Wholesale Portal open — NET 30 credit terms & pallet freight for registered businesses" },
  { icon: Truck, text: "📦 Same-day dispatch on 500+ SKUs from our Mumbai, Delhi & Bangalore fulfilment centres" },
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const { icon: Icon, text } = ANNOUNCEMENTS[activeIdx];

  return (
    <div className="bg-brand-700 text-white relative overflow-hidden">
      {/* Subtle animated gradient sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-800/0 via-white/5 to-brand-800/0 animate-[shimmer_3s_ease-in-out_infinite]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 relative z-10">
        <div className="flex-1 flex items-center justify-center gap-2.5 text-center min-w-0">
          <Icon className="w-3.5 h-3.5 text-gold-300 shrink-0" />
          <p className="text-[11px] sm:text-xs font-semibold tracking-wide truncate text-white/95">
            {text}
          </p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="p-1 rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Slide progress dots */}
      <div className="flex items-center justify-center gap-1 pb-1">
        {ANNOUNCEMENTS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`h-0.5 rounded-full transition-all duration-500 ${
              idx === activeIdx ? "w-5 bg-gold-400" : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
