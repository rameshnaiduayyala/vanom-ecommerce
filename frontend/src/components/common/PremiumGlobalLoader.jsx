
import React from "react";
import { useUIStore } from "@/stores/ui.store.js";
import { Loader2 } from "lucide-react";

export function PremiumGlobalLoader() {
  const { isGlobalLoading, globalLoadingText } = useUIStore();

  if (!isGlobalLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex flex-col items-center"
    >
      {/* Sleek Top Progress Bar */}
      <div className="h-[2.5px] w-full overflow-hidden bg-transparent">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-[#00875A] to-[#00B074] shadow-[0_0_10px_rgba(0,135,90,0.6)] animate-pulse" />
      </div>

      {/* Floating Minimalist Smart Pill */}
      <div className="mt-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/85 dark:bg-slate-950/90 text-white backdrop-blur-md shadow-lg shadow-black/10 border border-white/10 text-xs font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00B074]" />
          <span className="tracking-wide text-[11px] font-semibold text-slate-100">
            {globalLoadingText || "Loading..."}
          </span>
        </div>
      </div>
    </div>
  );
}
