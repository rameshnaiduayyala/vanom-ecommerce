import React, { lazy, Suspense } from "react";
import { Lock } from "lucide-react";
import { SEO } from "../../../components/common/SEO.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { AuthModal } from "../../../components/auth/AuthModal.jsx";
import { useCheckout } from "../hooks/useCheckout.js";
import { CheckoutAddressForm } from "../components/CheckoutAddressForm.jsx";
import { CheckoutShippingSelector } from "../components/CheckoutShippingSelector.jsx";
import { CheckoutOrderSummary } from "../components/CheckoutOrderSummary.jsx";

const StripePaymentModal = lazy(() =>
  import("../components/StripePaymentModal.jsx").then((m) => ({
    default: m.StripePaymentModal || m.default,
  }))
);


export function CheckoutPage() {
  const checkout = useCheckout();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SEO
        title="Secure Checkout | Vanom"
        description="Complete your order securely with 256-bit encrypted checkout."
        noindex={true}
      />

      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {checkout.country.flag} Shipping to {checkout.country.name}
          </p>
        </div>
        <Badge variant="brand" size="md" className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" /> 256-bit Encrypted
        </Badge>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <form onSubmit={checkout.handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Shipping Address & Carrier Options */}
        <div className="lg:col-span-2 space-y-6">
          <CheckoutAddressForm
            formData={checkout.formData}
            setField={checkout.setField}
            country={checkout.country}
          />

          {/* Shippo Live Carrier Shipping Selection */}
          <CheckoutShippingSelector
            shippingRates={checkout.shippingRates}
            selectedRateId={checkout.selectedRate?.id}
            onSelectRate={checkout.setSelectedRate}
            isLoadingRates={checkout.isLoadingRates}
            addressValidation={checkout.addressValidation}
            originWarehouse={checkout.originWarehouse}
            freeShippingEligible={checkout.freeShippingEligible}
            currencySymbol={checkout.country.symbol || "$"}
            onRefreshRates={checkout.recalculateRates}
          />

          {/* Secure Payment Assurance */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Secure Payment with Stripe</p>
                <p className="text-[11px] text-slate-500">
                  Credit & Debit Cards, Apple Pay, Google Pay, Link, and Installments open securely in the payment window.
                </p>
              </div>
            </div>
            <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest shrink-0 hidden sm:block">
              256-Bit SSL
            </span>
          </div>
        </div>

        {/* Right: Order summary + CTA */}
        <CheckoutOrderSummary
          cart={checkout.cart}
          subtotal={checkout.subtotal}
          taxAmount={checkout.taxAmount}
          taxData={checkout.taxData}
          isCalculatingTax={checkout.isCalculatingTax}
          isTaxReady={checkout.isTaxReady}
          shipping={checkout.shipping}
          selectedRate={checkout.selectedRate}
          isLoadingRates={checkout.isLoadingRates}
          isShippingReady={checkout.isShippingReady}
          grandTotal={checkout.grandTotal}
          country={checkout.country}
          loading={checkout.loading}
          canPlaceOrder={checkout.canPlaceOrder}
          disabledReason={checkout.disabledReason}
        />
      </form>

      {/* Stripe Payment Element Modal (Lazy loaded when opened) */}
      {checkout.isStripeModalOpen && (
        <Suspense fallback={null}>
          <StripePaymentModal
            isOpen={checkout.isStripeModalOpen}
            onClose={checkout.closeStripeModal}
            clientSecret={checkout.stripeSession?.clientSecret}
            publishableKey={checkout.stripeSession?.publishableKey}
            order={checkout.stripeSession?.order}
            amount={checkout.stripeSession?.amount}
            currency={checkout.stripeSession?.currency}
            symbol={checkout.stripeSession?.symbol}
            onSuccess={checkout.handleStripeSuccess}
          />
        </Suspense>
      )}

      {/* Auth modal for guest checkout */}
      <AuthModal
        isOpen={checkout.showAuthModal}
        onClose={() => checkout.setShowAuthModal(false)}
        onSuccess={checkout.handleAuthSuccess}
        initialRole="B2C"
      />
    </div>
  );
}
