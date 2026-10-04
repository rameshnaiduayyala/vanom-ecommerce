
import React from "react";
import { useUIStore } from "@/stores/ui.store.js";
import vanomLogo from "@/assets/logo.png";
import { VANOM_COMPANY_DETAILS } from "@/constants/company.js";

export function PremiumGlobalLoader() {
  const { isGlobalLoading, globalLoadingText } = useUIStore();

  if (!isGlobalLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        overflow-hidden
        bg-white/80 dark:bg-slate-950/85
        backdrop-blur-xl
        animate-in fade-in duration-300
      "
    >
      {/* Ambient Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute left-1/2 top-1/2
            h-[420px] w-[420px]
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-emerald-500/10
            blur-[100px]
            animate-pulse
          "
        />

        <div
          className="
            absolute left-[35%] top-[40%]
            h-[180px] w-[180px]
            rounded-full
            bg-[#F9BC15]/10
            blur-[80px]
          "
        />
      </div>

      {/* Top Progress Line */}
      <div className="absolute left-0 right-0 top-0 h-[2px] overflow-hidden bg-slate-200/60 dark:bg-white/10">
        <div
          className="
            h-full w-[35%]
            bg-gradient-to-r
            from-transparent
            via-emerald-500
            to-[#F9BC15]
            shadow-[0_0_12px_rgba(16,185,129,0.8)]
            animate-[loader-progress_1.5s_ease-in-out_infinite]
          "
        />
      </div>

      {/* Main Loader */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo Container */}
        <div className="relative mb-7 flex h-28 w-28 items-center justify-center">
          {/* Outer Glow */}
          <div
            className="
              absolute inset-0
              rounded-[32px]
              bg-emerald-500/10
              blur-2xl
              animate-pulse
            "
          />

          {/* Rotating Ring */}
          <div
            className="
              absolute inset-0
              rounded-[32px]
              border border-emerald-500/20
            "
          />

          <div
            className="
              absolute inset-[-5px]
              rounded-[36px]
              border-2
              border-transparent
              border-t-emerald-500
              border-r-[#F9BC15]
              animate-spin
            "
            style={{ animationDuration: "1.8s" }}
          />

          {/* Inner Logo Card */}
          <div
            className="
              relative
              flex h-[82px] w-[82px]
              items-center justify-center
              rounded-[26px]
              border border-slate-200/80
              bg-white/90
              shadow-[0_15px_45px_rgba(0,0,0,0.12)]
              dark:border-white/10
              dark:bg-slate-900/90
              dark:shadow-[0_15px_45px_rgba(0,0,0,0.4)]
              backdrop-blur-md
            "
          >
            <img
              src={vanomLogo}
              alt={VANOM_COMPANY_DETAILS.brandName}
              className="
                h-14 w-14
                object-contain
                drop-shadow-md
                animate-[logo-breathe_2s_ease-in-out_infinite]
              "
            />
          </div>
        </div>

        {/* Brand */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className="
              text-sm
              font-black
              uppercase
              tracking-[0.22em]
              text-slate-900
              dark:text-white
            "
          >
            {VANOM_COMPANY_DETAILS.brandName}
          </span>

          <span className="relative flex h-2 w-2">
            <span
              className="
                absolute inline-flex
                h-full w-full
                rounded-full
                bg-emerald-400
                opacity-75
                animate-ping
              "
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        </div>

        {/* Loading Message */}
        <p
          className="
            max-w-[280px]
            truncate
            text-sm
            font-medium
            text-slate-500
            dark:text-slate-400
          "
        >
          {globalLoadingText || "Preparing your experience..."}
        </p>

        {/* Animated Loading Dots */}
        <div className="mt-5 flex items-center gap-1.5">
          <span
            className="
              h-1.5 w-1.5
              rounded-full
              bg-emerald-500
              animate-bounce
            "
          />

          <span
            className="
              h-1.5 w-1.5
              rounded-full
              bg-emerald-500
              animate-bounce
            "
            style={{ animationDelay: "120ms" }}
          />

          <span
            className="
              h-1.5 w-1.5
              rounded-full
              bg-[#F9BC15]
              animate-bounce
            "
            style={{ animationDelay: "240ms" }}
          />
        </div>

        {/* Bottom Hint */}
        <div
          className="
            mt-8
            rounded-full
            border border-slate-200/70
            bg-white/50
            px-4 py-1.5
            text-[10px]
            font-semibold
            uppercase
            tracking-widest
            text-slate-400
            dark:border-white/10
            dark:bg-white/5
            dark:text-slate-500
          "
        >
          Please wait
        </div>
      </div>

      {/* Bottom Gradient */}
      <div
        className="
          pointer-events-none
          absolute bottom-0 left-0 right-0
          h-32
          bg-gradient-to-t
          from-emerald-500/[0.03]
          to-transparent
        "
      />

      {/* Custom Animations */}
      <style>{`
@keyframes loader - progress {
  0 % {
    transform: translateX(-120 %);
  }
  50 % {
    transform: translateX(180 %);
  }
  100 % {
    transform: translateX(400 %);
  }
}

@keyframes logo - breathe {
  0 %, 100 % {
    transform: scale(1);
  }
  50 % {
    transform: scale(1.06);
  }
}
`}</style>
    </div>
  );
}