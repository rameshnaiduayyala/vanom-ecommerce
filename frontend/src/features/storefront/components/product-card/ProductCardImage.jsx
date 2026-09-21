import React from "react";
import { Link } from "react-router-dom";
import { Heart, PackageX } from "lucide-react";
import { ProductBadge } from "../ProductBadge.jsx";

export function ProductCardImage({
  productUrl,
  productName,
  productImage,
  effectiveBadge,
  discount,
  wishlisted,
  isOutOfStock,
  onWishlistClick,
  variant = "default",
}) {
  const isCompact = variant === "compact";

  return (
    <div className="relative w-full aspect-square bg-gradient-to-b from-[#F8FAF9] via-[#F3F8F5] to-[#EAF4EF]/60 overflow-hidden flex items-center justify-center border-b border-gray-100">
      {/* Product Image Link */}
      <Link
        to={productUrl}
        aria-label={productName}
        className={`w-full h-full flex items-center justify-center ${
          isCompact ? "p-3 sm:p-4" : "p-4 sm:p-5"
        }`}
      >
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-xs"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center p-4 bg-emerald-50/70 rounded-2xl border border-dashed border-emerald-300/80">
            <span className="font-extrabold text-xs sm:text-sm text-[#1a3c2e] leading-snug line-clamp-3">
              {productName}
            </span>
          </div>
        )}
      </Link>

      {/* Badges Stack (Discount & Highlight) */}
      <ProductBadge
        badge={effectiveBadge}
        discount={discount}
        size={isCompact ? "sm" : "md"}
      />

      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10 pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <PackageX className="w-3.5 h-3.5 text-rose-400" />
            <span>Sold Out</span>
          </div>
        </div>
      )}

      {/* Wishlist Button */}
      <div className="absolute top-2.5 right-2.5 z-20">
        <button
          type="button"
          onClick={onWishlistClick}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
            isCompact ? "w-7 h-7" : "w-8 h-8 sm:w-9 sm:h-9"
          } ${
            wishlisted
              ? "bg-rose-50 text-rose-600 border border-rose-200 scale-105"
              : "bg-white/90 hover:bg-white text-gray-400 hover:text-rose-500 border border-white/80 hover:scale-110"
          }`}
        >
          <Heart
            className={`${isCompact ? "w-3.5 h-3.5" : "w-4 h-4"} ${
              wishlisted ? "fill-current text-rose-500" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default ProductCardImage;
