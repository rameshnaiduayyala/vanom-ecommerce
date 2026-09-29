/**
 * AnnouncementBar.jsx
 * Top-of-page announcement bar rendered ABOVE the header in PublicLayout.
 * Dynamically wired to global Store Settings configured by Superadmin.
 */
import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useStoreSettingsStore } from "@/stores/store.store.js";

const DEFAULT_PROMO_MESSAGES = [
  "Free shipping on orders above ₹999",
  "Use code VANOM10 for 10% off your first order",
  "Now delivering to 30+ countries worldwide",
  "Best Prices Guaranteed • Genuine Brands • Easy Returns",
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const { store, fetchPublicStore } = useStoreSettingsStore();

  useEffect(() => {
    fetchPublicStore();
  }, [fetchPublicStore]);

  // If dismissed by user, do not render
  if (!visible) return null;

  // If store settings explicitly disable the announcement bar, do not render
  if (store && store.isAnnouncementActive === false) {
    return null;
  }

  // Parse messages from Store Settings (supports splitting by newline OR '|')
  let messages = DEFAULT_PROMO_MESSAGES;
  if (store?.announcementBarText && store.announcementBarText.trim().length > 0) {
    const custom = store.announcementBarText
      .split(/\r?\n|\|/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (custom.length > 0) {
      messages = custom;
    }
  }

  // Ensure enough items for smooth infinite marquee loop
  const displayItems = messages.length === 1 
    ? [messages[0], messages[0], messages[0], messages[0]]
    : [...messages, ...messages];

  return (
    <div className="w-full bg-[#1e5a45] border-b border-[rgb(60,170,130)]/40 text-white select-none z-50">
      <div
        className="max-w-[1400px] mx-auto px-3 sm:px-6 h-8 flex items-center justify-between gap-2"
        style={{ fontSize: "11px" }}
      >
        {/* ── Scrolling Marquee Announcements ── */}
        <div className="flex-1 overflow-hidden relative mx-2 sm:mx-4 flex items-center min-w-0 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]">
          <div className="animate-marquee flex items-center gap-8 text-white/95 font-medium">
            {displayItems.map((msg, idx) => (
              <span key={idx} className="flex items-center gap-3 shrink-0 cursor-pointer hover:text-[#D9A514] transition-colors">
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
            title="Dismiss Announcement"
            aria-label="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
