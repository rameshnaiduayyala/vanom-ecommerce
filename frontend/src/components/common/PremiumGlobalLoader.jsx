import React from "react";
import { useUIStore } from "@/stores/ui.store.js";
import vanomLogo from "@/assets/logo.png";
import { VANOM_COMPANY_DETAILS } from "@/constants/company.js";

/**
 * PremiumGlobalLoader
 * Modern, ultra-lightweight, transparent frosted-glass floating pill loader.
 * Completely non-intrusive with soft emerald brand glow and linear progress shimmer.
 */
export function PremiumGlobalLoader() {
  const { isGlobalLoading, globalLoadingText } = useUIStore();

  if (!isGlobalLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-900/15 backdrop-blur-[2px] transition-all duration-200 animate-in fade-in"
    >
      {/* Top Edge Slim Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-emerald-500/20 z-100 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-[#F9BC15] to-emerald-400 w-1/2 animate-[shimmer_1.2s_infinite_linear]" />
      </div>

      {/* Floating Modern Frosted Pill */}
      <div className="relative z-10 flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12)] backdrop-blur-md animate-in zoom-in-95">
        
        {/* Breathing Logo */}
        <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-lg bg-emerald-500/20 blur-xs animate-pulse" />
          <img
            src={vanomLogo}
            alt={VANOM_COMPANY_DETAILS.brandName}
            className="w-6 h-6 object-contain drop-shadow-xs animate-pulse"
          />
        </div>

        {/* Text & Subtle Status */}
        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {VANOM_COMPANY_DETAILS.brandName}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
            {globalLoadingText || "Loading..."}
          </span>
        </div>
      </div>
    </div>
  );
}
