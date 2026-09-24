import React from "react";
import { Link } from "react-router-dom";
import { Heart, PackageX, Eye } from "lucide-react";
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
    <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 flex items-center justify-center">
      {/* Background shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none z-0" />

      {/* Product Image */}
      <Link
        to={productUrl}
        aria-label={productName}
        className={`relative z-10 w-full h-full flex items-center justify-center ${
          isCompact ? "p-3 sm:p-4" : "p-5 sm:p-6"
        }`}
      >
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform drop-shadow-sm"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center p-4 rounded-2xl border border-dashed border-slate-300/60 bg-white/50">
            <span className="font-bold text-xs sm:text-sm text-slate-500 leading-snug line-clamp-3">
              {productName}
            </span>
          </div>
        )}
      </Link>

      {/* Quick View on hover */}
      <Link
        to={productUrl}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap hover:bg-slate-900 hover:text-white"
      >
        <Eye className="w-3 h-3" />
        <span>Quick View</span>
      </Link>

      {/* Badges */}
      <ProductBadge
        badge={effectiveBadge}
        discount={discount}
        size={isCompact ? "sm" : "md"}
      />

      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
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
          className={`rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer shadow-lg ${
            isCompact ? "w-7 h-7" : "w-8 h-8 sm:w-9 sm:h-9"
          } ${
            wishlisted
              ? "bg-rose-500 text-white border border-rose-400 scale-110"
              : "bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 border border-white/60 hover:scale-110 hover:shadow-xl"
          }`}
        >
          <Heart
            className={`${isCompact ? "w-3.5 h-3.5" : "w-4 h-4"} transition-all duration-300 ${
              wishlisted ? "fill-current text-white scale-110" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default ProductCardImage;
