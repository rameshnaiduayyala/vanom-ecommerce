import React from "react";
import { useProductCard } from "../hooks/useProductCard.js";
import { ProductCardImage } from "./product-card/ProductCardImage.jsx";
import { ProductCardInfo } from "./product-card/ProductCardInfo.jsx";
import { ProductCardActions } from "./product-card/ProductCardActions.jsx";

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
    quantity,
    addingToCart,
    wishlisted,
    isOutOfStock,
    rating,
    reviewCount,
    subtitle,
    handleAddToCart,
    handleStepQuantity,
    handleWishlist,
  } = useProductCard({ ...product, badge: product?.badge || badge });

  if (!product) return null;

  const productUrl = `/products/${product.slug || product.id || product._id}`;
  const categoryName = product.category?.name || product.category || "Organic";
  const isCompact = variant === "compact";

  return (
    <div
      className={`group relative bg-white flex flex-col justify-between overflow-hidden w-full min-w-0 transition-all duration-300
        border border-slate-100 hover:border-slate-200
        shadow-sm hover:shadow-xl hover:shadow-slate-200/80
        hover:-translate-y-1
        ${isCompact ? "rounded-2xl" : "rounded-2xl sm:rounded-3xl"}
        ${className}`}
    >
      {/* Subtle top accent line that appears on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 rounded-t-3xl" />

      {/* ── Image & Badges ── */}
      <ProductCardImage
        productUrl={productUrl}
        productName={product.name}
        productImage={productImage}
        effectiveBadge={effectiveBadge}
        discount={discount}
        wishlisted={wishlisted}
        isOutOfStock={isOutOfStock}
        onWishlistClick={handleWishlist}
        variant={variant}
      />

      {/* ── Info & Actions Container ── */}
      <div
        className={`flex-1 flex flex-col justify-between min-w-0 ${
          isCompact ? "p-3 sm:p-3.5" : "p-4 sm:p-5"
        }`}
      >
        <ProductCardInfo
          productUrl={productUrl}
          productName={product.name}
          categoryName={categoryName}
          rating={rating}
          reviewCount={reviewCount}
          subtitle={subtitle}
          price={price}
          originalPrice={originalPrice}
          country={country}
          variant={variant}
        />

        <ProductCardActions
          quantity={quantity}
          addingToCart={addingToCart}
          isOutOfStock={isOutOfStock}
          onStepQuantity={handleStepQuantity}
          onAddToCart={handleAddToCart}
          variant={variant}
        />
      </div>
    </div>
  );
}

export default ProductCard;
