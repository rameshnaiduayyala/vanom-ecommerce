import React, { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/stores/ui.store.js";

export function PremiumGlobalLoader() {
  const { isGlobalLoading, globalLoadingText } = useUIStore();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (isGlobalLoading) {
      setProgress(0);
      setVisible(true);
      startRef.current = performance.now();

      const tick = (now) => {
        const elapsed = now - startRef.current;
        // Fast start, then slow asymptotic approach to 92%
        const raw = 1 - Math.exp(-elapsed / 2200);
        const capped = Math.min(raw * 92, 92);
        setProgress(capped);
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } else {
      // Snap to 100%, then fade out
      cancelAnimationFrame(rafRef.current);
      setProgress(100);
      const t = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isGlobalLoading]);

  if (!visible) return null;

  const displayText = globalLoadingText || "Retrieving data...";

  return (
    <>
      {/* ── Enterprise Bottom Progress Rail ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] h-[2px] bg-transparent"
      >
        {/* Track */}
        <div className="absolute inset-0 bg-slate-200/30" />

        {/* Fill bar */}
        <div
          className="absolute left-0 bottom-0 h-full origin-left rounded-r-full transition-none"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #00875A 0%, #00B07A 55%, #F9BC15 100%)",
            boxShadow: "0 0 12px rgba(0,135,90,0.7), 0 0 4px rgba(249,188,21,0.5)",
            transition: progress === 100 ? "width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease" : "width 0.12s linear",
            opacity: progress === 100 ? 0 : 1,
          }}
        />

        {/* Shimmer leading edge */}
        {isGlobalLoading && (
          <div
            className="absolute bottom-0 h-full w-12 rounded-full"
            style={{
              left: `calc(${progress}% - 3rem)`,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
              transition: "left 0.12s linear",
            }}
          />
        )}
      </div>

      {/* ── Enterprise Status Pill ── */}
      <div
        role="status"
        aria-live="polite"
        aria-label={displayText}
        className="pointer-events-none fixed bottom-4 right-4 z-[9998]"
        style={{
          animation: "vanom-pill-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
          opacity: isGlobalLoading ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      >
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-700/60 bg-slate-900/90 px-3.5 py-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {/* Animated dot cluster */}
          <span className="flex shrink-0 items-center gap-[3px]">
            {[0, 130, 260].map((delay, i) => (
              <span
                key={i}
                className="block h-1.5 w-1.5 rounded-full"
                style={{
                  background: i === 2 ? "#F9BC15" : "#00B07A",
                  animation: `vanom-dot-pulse 1.1s ${delay}ms ease-in-out infinite`,
                }}
              />
            ))}
          </span>

          {/* Divider */}
          <span className="h-3.5 w-px bg-slate-600/60" />

          {/* Text */}
          <span className="max-w-[160px] truncate text-[11px] font-semibold tracking-wide text-slate-200">
            {displayText}
          </span>

          {/* Progress % badge */}
          <span className="ml-0.5 shrink-0 rounded-md bg-slate-700/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-300">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes vanom-pill-in {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes vanom-dot-pulse {
          0%, 100% { transform: scaleY(1);   opacity: 0.6; }
          50%       { transform: scaleY(1.7); opacity: 1;   }
        }
      `}</style>
    </>
  );
}
