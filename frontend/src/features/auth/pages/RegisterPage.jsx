import React from "react";
import { SEO } from "@/components/common/SEO.jsx";
import { useRegisterForm } from "../hooks/useRegisterForm.js";
import { AuthHeader } from "../components/AuthHeader.jsx";
import { B2BCalloutBanner } from "../components/B2BCalloutBanner.jsx";
import { RegisterFormCard } from "../components/RegisterFormCard.jsx";
import { SecurityTrustBadges } from "../components/SecurityTrustBadges.jsx";

export { ForgotPasswordPage } from "./ForgotPasswordPage.jsx";

export function RegisterPage() {
  const {
    formData,
    countriesList,
    loading,
    errorMessage,
    handleChange,
    handleSubmit,
  } = useRegisterForm();

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* ── Background Image Layer (Natural Colors, Subtle Botanical Backdrop) ── */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/vanom-login-bg.webp')" }}
      />
      {/* ── Seamless Multi-Stop Dark-Green Gradient & Vignette ── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06140b]/70 via-[#07190e]/80 to-[#040d07]/90" />

      <SEO
        title="Create Retail Customer Account | Vanom"
        description="Create your Vanom customer account for fast checkout, order tracking, and exclusive discounts."
        noindex={true}
      />
      <div className="relative z-10 w-full max-w-xl space-y-6">
        {/* Header */}
        <AuthHeader
          title="Create Your Account"
          subtitle="Sign up for personal shopping, express checkout, and order tracking."
        />

        {/* Commercial B2B Banner Callout */}
        <B2BCalloutBanner />

        {/* Retail Registration Form */}
        <RegisterFormCard
          formData={formData}
          handleChange={handleChange}
          countriesList={countriesList}
          loading={loading}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
        />

        {/* Security badges */}
        <SecurityTrustBadges
          firstLabel="256-Bit SSL Encryption"
          secondLabel="Buyer Protection"
        />
      </div>
    </div>
  );
}

export default RegisterPage;
