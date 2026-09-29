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
    isVariable,
    selectedVariantId,
    setSelectedVariantId,
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
      className={`group relative bg-white flex flex-col overflow-hidden w-full min-w-0
        transition-all duration-300 ease-out
        border border-slate-100 hover:border-slate-200/80
        shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)]
        hover:-translate-y-1.5
        ${isCompact ? "rounded-2xl" : "rounded-2xl sm:rounded-3xl"}
        ${className}`}
    >
      {/* Hover accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 rounded-t-3xl" />

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
        className={`flex flex-col flex-1 min-w-0 ${
          isCompact ? "p-3 gap-2.5" : "p-4 sm:p-5 gap-3"
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
          isVariable={isVariable}
          variants={product?.variants}
          selectedVariantId={selectedVariantId}
          onSelectVariant={setSelectedVariantId}
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
