import React from "react";
import { Link } from "react-router-dom";
import { Heart, Check } from "lucide-react";
import { useProductCard } from "../../hooks/useProductCard.js";
import { ProductBadge } from "../ProductBadge.jsx";
import { QuantityStepper } from "../QuantityStepper.jsx";
import { formatPrice } from "../../../../utils/formatters.js";

export function ProductCardCompact({ product, badge = null }) {
  const {
    country,
    price,
    originalPrice,
    productImage,
    effectiveBadge,
    quantity,
    addingToCart,
    wishlisted,
    handleAddToCart,
    handleStepQuantity,
    handleWishlist,
    discount,
  } = useProductCard({ ...product, badge: product.badge || badge });

  const productUrl = `/products/${product.slug || product.id}`;
  const rating      = product.rating || 4.8;

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-[rgb(60,170,130)]/50 hover:shadow-xl hover:shadow-[rgb(60,170,130)]/12 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs w-full min-w-0">

      {/* ── Image area ─────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#F8FAF9] via-[#F3F8F5] to-[#EAF4EF]/60 overflow-hidden flex items-center justify-center border-b border-gray-100">
        <Link to={productUrl} className="w-full h-full flex items-center justify-center p-3 sm:p-4">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-xs"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <ProductBadge badge={effectiveBadge} discount={discount} size="sm" />

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
            wishlisted
              ? "bg-rose-50 text-rose-600 border border-rose-200 scale-105"
              : "bg-white/85 hover:bg-white text-gray-400 hover:text-rose-500 border border-white/80 hover:scale-110"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current text-rose-500" : ""}`} />
        </button>
      </div>

      {/* ── Info + Actions ─────────────────────────────────────────────── */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9.5px] font-extrabold tracking-wider uppercase text-[rgb(60,170,130)] truncate">
              {product.category?.name || product.category || "Organic"}
            </span>
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="text-[#F9BC15] text-xs">★</span>
              <span className="text-[10px] font-bold text-gray-800">{rating}</span>
            </div>
          </div>

          {/* Name */}
          <Link to={productUrl} className="block group-hover:text-[rgb(60,170,130)] transition-colors">
            <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle */}
          <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5 mb-2 font-normal">
            {product.subtitle || product.specs || "100% Pure Organic"}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 flex-wrap mb-2.5">
            <span className="text-sm sm:text-base font-black text-gray-900">
              {formatPrice(price, country.currency, country.symbol)}
            </span>
            {originalPrice > price && (
              <span className="text-[10px] text-gray-400 line-through font-medium">
                {formatPrice(originalPrice, country.currency, country.symbol)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-1 flex items-center gap-1.5 w-full">
          <QuantityStepper
            quantity={quantity}
            size="sm"
            onDecrease={(e) => handleStepQuantity(e, -1)}
            onIncrease={(e) => handleStepQuantity(e, 1)}
          />
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wide transition-all duration-200 shadow-2xs cursor-pointer flex items-center justify-center gap-1 border ${
              addingToCart
                ? "bg-[#3CAA82] text-white border-[#3CAA82]"
                : "bg-[#3e8e45] hover:bg-green-500 text-white border-[#d7e4a7] active:scale-95"
            }`}
          >
            {addingToCart ? (
              <><Check className="w-3 h-3 animate-in zoom-in" /><span>ADDED</span></>
            ) : (
              <span>ADD TO CART</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCardCompact;
