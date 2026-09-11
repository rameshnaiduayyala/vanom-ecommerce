import React from "react";
import { Link } from "react-router-dom";
import { Heart, Check } from "lucide-react";
import { useProductCard } from "../hooks/useProductCard.js";
import { ProductBadge } from "./ProductBadge.jsx";
import { QuantityStepper } from "./QuantityStepper.jsx";
import { formatPrice } from "../../../utils/formatters.js";

export function ProductCard({ product, badge = null }) {
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
  const reviewCount = product.reviewsCount || product.reviews || 1104;

  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 hover:border-[rgb(60,170,130)]/50 hover:shadow-2xl hover:shadow-[rgb(60,170,130)]/12 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm">

      {/* ── Image area ─────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#F8FAF9] via-[#F3F8F5] to-[#EAF4EF]/60 overflow-hidden flex items-center justify-center border-b border-gray-100">
        <Link to={productUrl} aria-label={product.name} className="w-full h-full flex items-center justify-center p-5">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <ProductBadge badge={effectiveBadge} discount={discount} size="md" />

        {/* Wishlist */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleWishlist}
            aria-label="Add to Wishlist"
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
              wishlisted
                ? "bg-rose-50 text-rose-600 border border-rose-200 scale-105"
                : "bg-white/90 hover:bg-white text-gray-500 hover:text-rose-500 border border-white/80 hover:scale-110"
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-current text-rose-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Info + Actions ─────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[rgb(60,170,130)]">
              {product.category?.name || product.category || "Organic Collection"}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[#F9BC15]">★</span>
              <span className="text-xs font-bold text-gray-800">{rating}</span>
              <span className="text-[11px] text-gray-400">
                ({reviewCount > 999 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
              </span>
            </div>
          </div>

          {/* Name */}
          <Link to={productUrl} className="block group-hover:text-[rgb(60,170,130)] transition-colors">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle */}
          <p className="text-xs text-gray-500 line-clamp-1 mt-1 mb-3 font-normal">
            {product.specs || product.subtitle || product.description || "100% Pure Organic · Lab Certified"}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap mb-4">
            <span className="text-base sm:text-xl font-black text-gray-900">
              {formatPrice(price, country.currency, country.symbol)}
            </span>
            {originalPrice > price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                {formatPrice(originalPrice, country.currency, country.symbol)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2 w-full">
          <QuantityStepper
            quantity={quantity}
            size="md"
            onDecrease={(e) => handleStepQuantity(e, -1)}
            onIncrease={(e) => handleStepQuantity(e, 1)}
          />
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 border ${
              addingToCart
                ? "bg-[#3CAA82] text-white border-[#3CAA82]"
                : "bg-[#F0F5D6] hover:bg-[#e4ecc0] text-[#1E3B2B] border-[#d7e4a7] active:scale-95"
            }`}
          >
            {addingToCart ? (
              <><Check className="w-4 h-4 animate-in zoom-in" /><span>ADDED</span></>
            ) : (
              <span>ADD TO CART</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
