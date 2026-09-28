import React from "react";

export function PageLoader({ message = "Loading..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8 transition-opacity duration-200"
    >
      <div className="relative flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-[3px] border-emerald-500/20 border-t-[#358B5B] animate-spin" />
        <span className="text-xs font-medium text-slate-500 tracking-wide select-none">
          {message}
        </span>
      </div>
    </div>
  );
}

export default PageLoader;
