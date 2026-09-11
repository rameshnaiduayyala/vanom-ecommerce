import React from "react";
import { Lock } from "lucide-react";
import { SEO } from "../../../components/common/SEO.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { AuthModal } from "../../../components/auth/AuthModal.jsx";
import { useCheckout } from "../hooks/useCheckout.js";
import { CheckoutAddressForm } from "../components/CheckoutAddressForm.jsx";
import { CheckoutPaymentSelector } from "../components/CheckoutPaymentSelector.jsx";
import { CheckoutOrderSummary } from "../components/CheckoutOrderSummary.jsx";

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

        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          <CheckoutAddressForm
            formData={checkout.formData}
            setField={checkout.setField}
            country={checkout.country}
          />
          <CheckoutPaymentSelector
            paymentMethod={checkout.formData.paymentMethod}
            onSelect={(pm) => checkout.setField("paymentMethod", pm)}
            countryCode={checkout.country.code}
          />
        </div>

        {/* Right: Order summary + CTA */}
        <CheckoutOrderSummary
          cart={checkout.cart}
          subtotal={checkout.subtotal}
          taxAmount={checkout.taxAmount}
          taxData={checkout.taxData}
          isCalculatingTax={checkout.isCalculatingTax}
          shipping={checkout.shipping}
          grandTotal={checkout.grandTotal}
          country={checkout.country}
          loading={checkout.loading}
        />
      </form>

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
