import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";
import { SEO } from "@/components/common/SEO.jsx";
import PublicFooter from "@/layouts/public/PublicFooter.jsx";
import { useBusinessRegistration } from "../hooks/useBusinessRegistration.js";
import { BusinessValueProps } from "../components/business/BusinessValueProps.jsx";
import { BusinessRegistrationStepper } from "../components/business/BusinessRegistrationStepper.jsx";
import { BusinessInfoStep } from "../components/business/BusinessInfoStep.jsx";
import { AdminUserStep } from "../components/business/AdminUserStep.jsx";

export function RegisterBusinessPage() {
  const {
    step,
    setStep,
    loading,
    errorMessage,
    countriesList,
    formData,
    handleChange,
    handleNext,
    handleBack,
    handleSubmit,
    validateStep1,
  } = useBusinessRegistration();

  const canGoToStep2 = Boolean(
    formData.businessName &&
    formData.legalName &&
    formData.addressLine1 &&
    formData.city
  );

  return (
    <div className="w-screen bg-[#F8FAF9] text-[#1E2922] flex flex-col justify-between overflow-x-hidden lg:overflow-hidden font-sans">
      <SEO
        title="Vanom Wholesale & Commercial Registration | Enterprise Portal"
        description="Register your business entity on Vanom. Unlock pallet wholesale pricing, Net-30 credit lines, and container logistics."
      />

      {/* ─── Compact Top Header ─── */}
      <header className="h-14 sm:h-16 px-4 sm:px-8 border-b border-[#E2EAE5] bg-[#F7F2DF] backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Vanom"
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <span className="text-[7px] font-black tracking-wider uppercase bg-[#E6F4EA] text-[#00875A] px-2.5 py-0.5 rounded-full border border-[#00875A]/20">
            Wholesale
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-1 text-[#5E7D67] hover:text-[#0F2B1C] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Store</span>
          </Link>
          <span className="text-[#DCE8DF]">|</span>
          <Link
            to={ROUTES.LOGIN}
            className="px-3 py-1.5 rounded-lg border border-[#DCE8DF] hover:border-[#00875A] text-[#0F2B1C] hover:text-[#00875A] bg-white transition-all text-xs font-bold"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ─── Split View Main Body ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-4 lg:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center overflow-hidden">
        {/* Left Column: Value Proposition */}
        <BusinessValueProps />

        {/* Right Column: 2-Step Registration Form Card */}
        <div className="lg:col-span-7 h-full flex flex-col justify-center">
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#DCE8DF] shadow-xl shadow-emerald-950/[0.04] relative">
            {/* Stepper Header */}
            <BusinessRegistrationStepper
              step={step}
              onStepClick={(targetStep) => {
                if (targetStep === 1) handleBack();
                else if (targetStep === 2 && validateStep1()) setStep(2);
              }}
              canGoToStep2={canGoToStep2}
            />

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-3.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1 or Step 2 */}
            {step === 1 ? (
              <BusinessInfoStep
                formData={formData}
                handleChange={handleChange}
                countriesList={countriesList}
                onNext={handleNext}
              />
            ) : (
              <AdminUserStep
                formData={formData}
                handleChange={handleChange}
                loading={loading}
                onBack={handleBack}
                onSubmit={handleSubmit}
              />
            )}

            {/* Bottom Switch Links */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E8EDE9] text-xs text-[#5E7D67] mt-3">
              <p>
                Need personal shopping?{" "}
                <Link to={ROUTES.REGISTER} className="text-[#00875A] font-bold hover:underline">
                  Retail Account
                </Link>
              </p>
              <p>
                Existing user?{" "}
                <Link to={ROUTES.LOGIN} className="text-[#00875A] font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}

export default RegisterBusinessPage;
