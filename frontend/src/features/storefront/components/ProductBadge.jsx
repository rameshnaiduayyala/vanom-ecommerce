import React from "react";
import { Sparkles } from "lucide-react";

/**
 * Renders the top-left floating badge stack on a product card.
 * Shared between ProductCard and ProductCardCompact.
 */
export function ProductBadge({ badge, discount, size = "md" }) {
  const textSm = size === "sm" ? "text-[8.5px]" : "text-[10px]";
  const px     = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const discSm = size === "sm" ? "text-[8px] px-1.5 py-0.5" : "text-[9.5px] px-2 py-0.5";

  if (!badge && !discount) return null;

  return (
    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
      {badge && (
        <div className="pointer-events-auto">
          {badge.toLowerCase().includes("best") ? (
            <span className={`inline-flex items-center gap-1 bg-[#F9BC15] text-[#1E3B2B] ${textSm} font-black uppercase tracking-wider ${px} rounded-full shadow-md`}>
              <Sparkles className={`${size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5"} fill-current`} />
              Bestseller
            </span>
          ) : badge.toLowerCase().includes("new") ? (
            <span className={`inline-flex items-center bg-[rgb(60,170,130)] text-white ${textSm} font-black uppercase tracking-wider ${px} rounded-full shadow-md`}>
              New
            </span>
          ) : badge.toLowerCase().includes("sale") ? (
            <span className={`inline-flex items-center bg-[#EF4444] text-white ${textSm} font-black uppercase tracking-wider ${px} rounded-full shadow-md`}>
              Sale
            </span>
          ) : (
            <span className={`inline-flex items-center bg-[rgb(60,170,130)] text-white ${textSm} font-black uppercase tracking-wider ${px} rounded-full shadow-md`}>
              {badge}
            </span>
          )}
        </div>
      )}
      {discount > 0 && (
        <span className={`bg-[#1E3B2B] text-white ${discSm} font-extrabold uppercase rounded-full shadow-md w-fit pointer-events-auto`}>
          {discount}% OFF
        </span>
      )}
    </div>
  );
}
