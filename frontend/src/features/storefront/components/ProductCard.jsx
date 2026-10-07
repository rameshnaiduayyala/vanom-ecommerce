import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Share2,
  ChevronDown,
  Star,
  Check,
  ShoppingCart,
  PackageX,
} from "lucide-react";
import { useProductCard } from "../hooks/useProductCard.js";
import { formatPrice } from "@/utils/formatters.js";

export function ProductCard({
  product,
  badge = null,
  variant = "default",
  className = "",
}) {
  const {
    country,
    price,
    originalPrice,
    discount,
    productImage,
    effectiveBadge,
    addingToCart,
    wishlisted,
    isOutOfStock,
    isVariable,
    selectedVariantObj,
    selectedVariantId,
    setSelectedVariantId,
    rating,
    reviewCount,
    handleAddToCart,
    handleWishlist,
  } = useProductCard({ ...product, badge: product?.badge || badge });

  if (!product) return null;

  // ── Gather all gallery images from product data ──
  const galleryImages = useMemo(() => {
    const list = [];
    if (productImage) list.push(productImage);

    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        const url = typeof img === "string" ? img : img?.url || img?.imageUrl;
        if (url && !list.includes(url)) list.push(url);
      });
    }

    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((img) => {
        const url = typeof img === "string" ? img : img?.url;
        if (url && !list.includes(url)) list.push(url);
      });
    }

    if (Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        const vImg = v?.image || v?.imageUrl;
        if (vImg && !list.includes(vImg)) list.push(vImg);
      });
    }

    return list.length > 0 ? list : [productImage || ""];
  }, [product, productImage]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const touchStartX = React.useRef(null);
  const isDragging = React.useRef(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 40;
    if (diff > threshold) {
      // Swiped left -> next image
      setActiveImageIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
    } else if (diff < -threshold) {
      // Swiped right -> prev image
      setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
    }
    touchStartX.current = null;
  };

  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (touchStartX.current !== null) {
      const diff = Math.abs(touchStartX.current - e.clientX);
      if (diff > 8) {
        isDragging.current = true;
      }
    }
  };

  const handleMouseUp = (e) => {
    if (touchStartX.current !== null) {
      const diff = touchStartX.current - e.clientX;
      const threshold = 40;
      if (diff > threshold) {
        // Dragged left -> next image
        setActiveImageIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
      } else if (diff < -threshold) {
        // Dragged right -> prev image
        setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      }
    }
    touchStartX.current = null;
  };

  const handleLinkClick = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = false;
    }
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIdx(index);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/products/${product.slug || product.id || product._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.name,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard?.writeText(url);
    }
  };

  const productUrl = `/products/${product.slug || product.id || product._id}`;
  const categoryName = product.category?.name || product.category || "General";
  const displayRating = rating || 4.6;
  const displayReviewCount = reviewCount > 0 ? reviewCount : 120;

  const savingsAmount =
    originalPrice > price ? Math.round(originalPrice - price) : null;

  return (
    <div
      className={`group relative bg-white flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden w-full min-w-0
        border border-gray-100 hover:border-gray-200
        shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:shadow-[0_4px_20px_rgba(0,0,0,0.06)]
        hover:shadow-[0_10px_30px_rgba(0,0,0,0.10)]
        transition-all duration-300 hover:-translate-y-1 select-none ${className}`}
    >
      {/* ── 1. Main Image Frame (Fixed Uncropped Container) ── */}
      <div
        className="relative w-full aspect-square overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Main Image Horizontal Slide Track */}
        <Link
          to={productUrl}
          onClick={handleLinkClick}
          aria-label={product.name}
          className="absolute inset-0 overflow-hidden"
        >
          {galleryImages.length > 0 && galleryImages[0] ? (
            <div
              className="flex h-full w-full transition-transform duration-500 ease-in-out will-change-transform"
              style={{ transform: `translateX(-${activeImageIdx * 100}%)` }}
            >
              {galleryImages.map((imgSrc, idx) => (
                <div
                  key={imgSrc || idx}
                  className="w-full h-full flex-none flex items-center justify-center p-3 sm:p-4 pointer-events-none"
                >
                  <img
                    src={imgSrc}
                    alt={product.name}
                    loading={idx === 0 ? "eager" : "lazy"}
                    draggable={false}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-xs select-none"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center p-2">
              <span className="font-bold text-xs text-gray-400">{product.name}</span>
            </div>
          )}
        </Link>

        {/* Top-Left: Discount Badge (Red Coral Pill) */}
        {discount > 0 && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#FF4D5E] text-white font-bold text-[10px] sm:text-xs shadow-sm sm:shadow-md tracking-tight">
              -{discount}%
            </span>
          </div>
        )}

        {/* Top-Right: Wishlist & Share Floating Buttons */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 flex flex-col gap-1.5 sm:gap-2">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm sm:shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer ${wishlisted
              ? "bg-rose-500 text-white"
              : "bg-white/95 text-gray-700 hover:text-rose-500 hover:scale-105"
              }`}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${wishlisted ? "fill-current text-white scale-110" : ""
                }`}
            />
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-gray-700 hover:text-[#358B5B] hover:scale-105 flex items-center justify-center shadow-sm sm:shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Bottom Small Dots Carousel Indicator */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/25 backdrop-blur-xs">
            {galleryImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDotClick(e, idx)}
                aria-label={`Go to image ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${activeImageIdx === idx
                  ? "w-4 h-1.5 bg-white shadow-xs"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                  }`}
              />
            ))}
          </div>
        )}
        {/* 
        {galleryImages.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-2.5 right-2 sm:right-2.5 z-20">
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] sm:text-[10px] font-medium tracking-wider backdrop-blur-xs">
              {activeImageIdx + 1}/{galleryImages.length}
            </span>
          </div>
        )} */}
      </div>

      {/* ── 2. Compact Product Details Block ── */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        {/* Category Label */}
        <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 capitalize truncate">
          {categoryName}
        </p>

        {/* Product Title */}
        <Link to={productUrl} className="block group/title">
          <h3 className="font-bold text-[13px] sm:text-[15px] text-[#172B2A] leading-snug line-clamp-1 group-hover/title:text-[#358B5B] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating & Stock Status Row */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          {/* Rating */}
          <div className="flex items-center gap-1 min-w-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-gray-800">
              {displayRating}
            </span>
            <span className="text-[10px] text-gray-400 truncate">
              ({displayReviewCount > 999 ? `${(displayReviewCount / 1000).toFixed(1)}k` : displayReviewCount})
            </span>
          </div>

          {/* In Stock / Out of Stock Pill */}
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold text-[10px] shrink-0">
              <PackageX className="w-2.5 h-2.5" />
              <span>Out of Stock</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF7F0] text-[#2E7D52] font-semibold text-[10px] shrink-0">
              <Check className="w-2.5 h-2.5 text-[#2E7D52]" strokeWidth={2.5} />
              <span>In Stock</span>
            </span>
          )}
        </div>

        {/* Pricing Row & Savings Pill */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5 flex-wrap">
          {/* Prices */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-[#172B2A] tracking-tight">
              {formatPrice(price, country.currency, country.symbol)}
            </span>

            {originalPrice > price && (
              <span className="text-[11px] sm:text-xs font-medium text-gray-400 line-through">
                {formatPrice(originalPrice, country.currency, country.symbol)}
              </span>
            )}
          </div>

          {/* Save Amount Pill */}
          {savingsAmount && (
            <span className="px-2 py-0.5 rounded-full bg-[#FEEBED] text-[#E53950] text-[10px] font-bold tracking-tight shrink-0">
              Save {formatPrice(savingsAmount, country.currency, country.symbol)}
            </span>
          )}
        </div>

        {/* Variant Dropdown (if product has variants) */}
        {isVariable && Array.isArray(product.variants) && product.variants.length > 0 && (
          <div className="pt-1 space-y-0.5">
            <div className="relative">
              <select
                value={selectedVariantId || product.variants[0]?.id || ""}
                onChange={(e) => {
                  setSelectedVariantId(e.target.value);
                }}
                className="w-full bg-[#F8FAF9] hover:bg-white text-gray-800 text-[11px] font-medium py-1.5 px-2.5 pr-7 rounded-xl border border-gray-200 hover:border-[#358B5B] focus:border-[#358B5B] focus:ring-1 focus:ring-[#358B5B] transition-all appearance-none cursor-pointer outline-none truncate"
              >
                {product.variants.map((v) => {
                  const label =
                    v.name ||
                    v.variant_name ||
                    (v.attributes && typeof v.attributes === "object"
                      ? Object.values(v.attributes).filter(Boolean).join(" / ")
                      : "Option");

                  return (
                    <option key={v.id} value={v.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* ── 3. Primary "Add to Cart" Button (Sleek Compact Pill) ── */}
        <div className="pt-1.5 mt-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart || isOutOfStock}
            className={`w-full py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs ${isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : addingToCart
                ? "bg-[#256B45] text-white"
                : "bg-[#1F5438] hover:bg-[#163E29] text-white active:scale-[0.98] hover:shadow-sm"
              }`}
          >
            {addingToCart ? (
              <>
                <Check className="w-3.5 h-3.5 animate-in zoom-in duration-200" strokeWidth={2.5} />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
