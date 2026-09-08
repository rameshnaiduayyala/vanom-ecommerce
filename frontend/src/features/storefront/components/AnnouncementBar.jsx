/**
 * AnnouncementBar.jsx
 * Top-of-page announcement bar rendered ABOVE the header in PublicLayout.
 * Matches reference: delivery pin | rotating promos | track/help/sell/sign-in links
 */
import React, { useState } from "react";
import { X } from "lucide-react";

const PROMO_MESSAGES = [
  "Free shipping on orders above ₹999",
  "Use code VANOM10 for 10% off your first order",
  "Now delivering to 30+ countries worldwide",
  "Best Prices Guaranteed • Genuine Brands • Easy Returns",
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

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

        {/* ── RIGHT: Dismiss button ── */}
        <div className="flex items-center gap-0 shrink-0">
          <button
            onClick={() => setVisible(false)}
            className="flex items-center px-2 h-8 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
