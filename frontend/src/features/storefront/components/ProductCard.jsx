import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Share2,
  ChevronDown,
  Star,
  Check,
  ShoppingCart,
  PackageX,
  Sparkles,
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

  const [isVariantOpen, setIsVariantOpen] = useState(false);
  const variantDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (variantDropdownRef.current && !variantDropdownRef.current.contains(e.target)) {
        setIsVariantOpen(false);
      }
    };
    if (isVariantOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVariantOpen]);

  const activeVariant = useMemo(() => {
    if (!Array.isArray(product.variants) || product.variants.length === 0) return null;
    return product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  }, [product.variants, selectedVariantId]);

  const getVariantLabel = (v) => {
    if (!v) return "Option";
    return (
      v.name ||
      v.variant_name ||
      (v.attributes && typeof v.attributes === "object"
        ? Object.values(v.attributes).filter(Boolean).join(" / ")
        : "Option")
    );
  };

  const getVariantPrice = (v) => {
    if (!v) return null;
    const isCanada = country?.code === "CA";
    const vCountryEntry = Array.isArray(v.countries)
      ? v.countries.find(
          (c) =>
            c.country?.code === country?.code ||
            c.currency === country?.currency
        )
      : null;
    const p = vCountryEntry?.price ?? (isCanada ? v.price_cad : v.price_usd) ?? v.price;
    return p ? Number(p) : null;
  };

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
      <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center">
        {/* Main Product Image */}
        <Link
          to={productUrl}
          aria-label={product.name}
          className="absolute inset-0 overflow-hidden flex items-center justify-center p-3 sm:p-4"
        >
          {productImage || galleryImages[0] ? (
            <img
              src={productImage || galleryImages[0]}
              alt={product.name}
              loading="lazy"
              draggable={false}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-xs select-none"
            />
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
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm sm:shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer ${
              wishlisted
                ? "bg-rose-500 text-white"
                : "bg-white/95 text-gray-700 hover:text-rose-500 hover:scale-105"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                wishlisted ? "fill-current text-white scale-110" : ""
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

        {/* ── Premium Rich Variant Selector Dropdown ── */}
        {isVariable && Array.isArray(product.variants) && product.variants.length > 0 && (
          <div className="pt-0.5 relative" ref={variantDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsVariantOpen((prev) => !prev);
              }}
              className={`w-full group/btn flex items-center justify-between gap-1.5 py-1.5 px-2.5 rounded-xl border text-[11px] font-semibold transition-all duration-200 cursor-pointer shadow-2xs ${
                isVariantOpen
                  ? "bg-white border-[#2E7D52] ring-2 ring-[#2E7D52]/15 text-[#172B2A]"
                  : "bg-slate-50/70 hover:bg-white border-slate-200/90 hover:border-slate-300 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {/* <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D52] shrink-0" /> */}
                <span className="truncate text-slate-800 font-bold">
                  {getVariantLabel(activeVariant)}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#2E7D52] transition-transform duration-200 shrink-0 ${
                  isVariantOpen ? "rotate-180 text-[#2E7D52]" : ""
                }`}
              />
            </button>

            {/* Custom Floating Menu */}
            {isVariantOpen && (
              <div className="absolute left-0 right-0 bottom-full mb-1.5 z-40 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1 space-y-0.5 max-h-48 overflow-y-auto">
                <div className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>Select Variant</span>
                  <span className="text-[9px] text-[#2E7D52] font-bold">
                    {product.variants.length} available
                  </span>
                </div>
                {product.variants.map((v) => {
                  const isSelected = (selectedVariantId || product.variants[0]?.id) === v.id;
                  const vPrice = getVariantPrice(v);
                  const isOutOfStockV = v.stock !== undefined && v.stock <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isOutOfStockV}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariantId(v.id);
                        setIsVariantOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#EBF7F0] text-[#1E5C3A] font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      } ${isOutOfStockV ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-[#2E7D52] shrink-0" strokeWidth={2.5} />
                        ) : (
                          <span className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="truncate">{getVariantLabel(v)}</span>
                      </div>
                      {vPrice && (
                        <span className={`text-[10px] font-bold shrink-0 ${isSelected ? "text-[#1E5C3A]" : "text-slate-500"}`}>
                          {formatPrice(vPrice, country.currency, country.symbol)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
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
