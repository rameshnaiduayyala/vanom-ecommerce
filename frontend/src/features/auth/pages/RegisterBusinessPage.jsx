import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, User, Building2, Check } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";
import { SEO } from "@/components/common/SEO.jsx";
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
    <div className="relative min-h-[92vh] flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#e8eedd]">
      {/* ── Background Landscape Image ── */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/vanom-login-bg.webp')" }}
      />

      {/* ── Soft Natural Vignette Gradient ── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#dbe5d1]/65 via-[#eaf0e2]/30 to-transparent" />

      <SEO
        title="Vanom Wholesale & Commercial Registration | Enterprise Portal"
        description="Register your business entity on Vanom. Unlock pallet wholesale pricing, Net-30 credit lines, and container logistics."
      />

      {/* ── Main Two-Column Container (Top-Aligned Matching Register Page) ── */}
      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Value Proposition & Brand Header */}
        <BusinessValueProps />

        {/* Right Column: 2-Step Registration Form Card */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-9 shadow-2xl shadow-emerald-950/15 border border-slate-100 max-w-xl w-full">
            {/* ── Top Account Type Switcher (Retail Customer vs Business / Wholesale) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Inactive / Link: Retail Customer */}
              <Link
                to={ROUTES.REGISTER}
                className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 group-hover:text-[#006B3C] flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate group-hover:text-[#006B3C] transition-colors">
                      Retail Customer
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      For personal shopping
                    </p>
                  </div>
                </div>
              </Link>

              {/* Active: Business / Wholesale */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-[#006B3C] flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006B3C] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                      Business / Wholesale
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      For stores, distributors & bulk
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#006B3C] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </div>

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
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
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

            {/* Already have an account? Sign In footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Already registered with Vanom?{" "}
                <Link
                  to={ROUTES.LOGIN}
                  className="font-bold text-[#006B3C] hover:text-[#00522E] hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterBusinessPage;
