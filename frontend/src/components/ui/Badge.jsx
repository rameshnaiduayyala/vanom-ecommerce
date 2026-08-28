import React from "react";
import { cn } from "../../utils/cn.js";

export function Badge({ children, variant = "default", size = "md", className }) {
  const base = "inline-flex items-center font-medium rounded-full";

  const variants = {
    default: "bg-surface-muted text-text-secondary border border-border",
    brand: "bg-brand-50 text-brand-700 border border-brand-200",
    gold: "bg-gold-50 text-gold-700 border border-gold-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    yellow: "bg-amber-50 text-amber-700 border border-amber-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    red: "bg-red-50 text-red-700 border border-red-200",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return <span className={cn(base, variants[variant], sizes[size], className)}>{children}</span>;
}
