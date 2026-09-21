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
    <div className="min-h-[85vh] flex items-center justify-center bg-[#F8FAF9] px-4 py-12">
      <SEO
        title="Create Retail Customer Account | Vanom"
        description="Create your Vanom customer account for fast checkout, order tracking, and exclusive discounts."
        noindex={true}
      />
      <div className="w-full max-w-md space-y-6">
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
