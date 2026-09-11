import React, { useMemo } from "react";
import { SEO } from "../../../components/common/SEO.jsx";
import { useCartPage } from "../hooks/useCartPage.js";
import { useCartTax } from "../hooks/useCartTax.js";
import { useCartCoupon } from "../hooks/useCartCoupon.js";
import {
  CartSkeleton,
  CartItemList,
  CartSummary,
  SavedForLaterList,
  CartRecommendations,
  EmptyCartView,
} from "../components/index.js";

export function CartPage() {
  const page = useCartPage();
  const coupon = useCartCoupon(page.selectedSubtotal);

  const estimatedShipping = useMemo(() => {
    if (page.selectedSubtotal >= 500 || page.selectedCount === 0) return 0;
    return page.destination.countryCode === "CA" ? 6.99 : 4.99;
  }, [page.selectedSubtotal, page.selectedCount, page.destination.countryCode]);

  const { taxData, isCalculatingTax, estimatedTax } = useCartTax({
    selectedCartItems: page.selectedCartItems,
    selectedSubtotal:  page.selectedSubtotal,
    destination:       page.destination,
  });

  const finalTotal = Math.max(
    0,
    page.selectedSubtotal - coupon.couponDiscount + estimatedTax + estimatedShipping
  );

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (page.isLoading && page.isEmpty) return <CartSkeleton />;

  if (page.isEmpty && page.savedItems.length === 0) {
    return (
      <EmptyCartView
        recommendedProducts={page.recommendedProducts}
        country={page.country}
        onAddToCart={page.handleAddRecommended}
      />
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <SEO
        title={`Shopping Cart (${page.cart.items.length} items) | Vanom`}
        description="Review items in your Vanom shopping cart and proceed to secure checkout."
        noindex={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left column ── */}
        <div className="lg:col-span-8 space-y-6">
          <CartItemList
            items={page.cart.items}
            selectedIds={page.selectedIds}
            giftOptions={page.giftOptions}
            country={page.country}
            allSelected={page.allSelected}
            selectedCount={page.selectedCount}
            selectedSubtotal={page.selectedSubtotal}
            onToggleSelectAll={page.toggleSelectAll}
            onToggleSelectItem={page.toggleSelectItem}
            onToggleGift={page.toggleGift}
            onQuantityChange={page.handleQuantity}
            onRemove={page.handleRemove}
            onSaveForLater={page.handleSaveForLater}
            onShare={page.handleShare}
          />

          <SavedForLaterList
            savedItems={page.savedItems}
            country={page.country}
            onMoveToCart={page.handleMoveToCart}
            onRemoveSaved={page.handleRemoveSaved}
          />

          <CartRecommendations
            products={page.recommendedProducts}
            country={page.country}
            onAddToCart={page.handleAddRecommended}
          />
        </div>

        {/* ── Right column ── */}
        <CartSummary
          selectedCount={page.selectedCount}
          selectedSubtotal={page.selectedSubtotal}
          totalSavings={page.totalSavings}
          finalTotal={finalTotal}
          estimatedShipping={estimatedShipping}
          estimatedTax={estimatedTax}
          taxData={taxData}
          isCalculatingTax={isCalculatingTax}
          couponCode={coupon.couponCode}
          setCouponCode={coupon.setCouponCode}
          appliedCoupon={coupon.appliedCoupon}
          couponDiscount={coupon.couponDiscount}
          couponError={coupon.couponError}
          onApplyCoupon={coupon.handleApplyCoupon}
          onRemoveCoupon={coupon.removeCoupon}
          destination={page.destination}
          setDestination={page.setDestination}
          country={page.country}
          hasSelectedOutOfStock={page.hasSelectedOutOfStock}
          onProceedToCheckout={page.handleProceedToCheckout}
          onClearCart={page.clearLocalCart}
        />
      </div>
    </div>
  );
}
