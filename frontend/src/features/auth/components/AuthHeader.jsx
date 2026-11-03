import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";

export function AuthHeader({ title, subtitle, badgeText }) {
  return (
    <div className="text-center space-y-3">
      {/* Brand Logo with Gentle Hover Elevation & Drop Shadow */}
      <Link
        to={ROUTES.HOME}
        className="inline-block group transition-transform duration-200 hover:scale-102"
        title="Return to Vanom Home"
      >
        <div className="relative inline-block">
          {/* Subtle Ambient Halo behind Logo */}
          <div className="absolute -inset-2 bg-emerald-400/20 blur-lg rounded-full pointer-events-none group-hover:bg-emerald-400/30 transition-colors" />
          <img
            src="/logo.png"
            alt="Vanom"
            className="relative h-11 sm:h-12 w-auto object-contain mx-auto drop-shadow-md"
          />
        </div>
      </Link>

      {/* Optional Badge */}
      {badgeText && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30 shadow-xs backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {badgeText}
          </span>
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="space-y-1">
        {title && (
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs text-[12px] text-emerald-200/80 mx-auto leading-relaxed font-medium drop-shadow-xs">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthHeader;
