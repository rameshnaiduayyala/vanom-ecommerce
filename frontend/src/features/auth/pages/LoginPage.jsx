import React from "react";
import { SEO } from "@/components/common/SEO.jsx";
import { useLoginForm } from "../hooks/useLoginForm.js";
import { AuthHeader } from "../components/AuthHeader.jsx";
import { QuickLoginSwitcher } from "../components/QuickLoginSwitcher.jsx";
import { LoginFormCard } from "../components/LoginFormCard.jsx";
import { SecurityTrustBadges } from "../components/SecurityTrustBadges.jsx";

export function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    loading,
    errorMessage,
    handleSubmit,
    handleQuickLogin,
    handleFillCredentials,
  } = useLoginForm();

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
        title="Sign In | Vanom"
        description="Sign in to your Vanom account to access your orders, wholesale quotes, and account dashboard."
        noindex={true}
      />
      <div className="relative z-10 max-w-md w-full space-y-5">
        {/* Header */}
        <AuthHeader
          subtitle="Access your global retail orders, procurement quotes & enterprise account"
        />

        {/* Quick 1-Click Login Bar */}
        <QuickLoginSwitcher
          onQuickLogin={handleQuickLogin}
          onFillCredentials={handleFillCredentials}
          loading={loading}
        />

        {/* Login Form Card */}
        <LoginFormCard
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          loading={loading}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
        />

        {/* Security & Compliance Badges */}
        <SecurityTrustBadges
          firstLabel="256-Bit SSL Encrypted"
          secondLabel="ISO 9001 Compliant"
        />
      </div>
    </div>
  );
}

export default LoginPage;
