import React from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/common/SEO.jsx";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Leaf,
  Sparkles,
} from "lucide-react";
import { useRegisterForm } from "../hooks/useRegisterForm.js";
import { RegisterFormCard } from "../components/RegisterFormCard.jsx";

export { ForgotPasswordPage } from "./ForgotPasswordPage.jsx";

const VALUE_PROPOSITIONS = [
  {
    icon: ShoppingBag,
    title: "Shop Global Products",
    description: "Browse 10,000+ natural products",
    color: "bg-amber-100/80 text-amber-800",
  },
  {
    icon: Truck,
    title: "Fast & Reliable Delivery",
    description: "Trusted shipping across 30+ countries",
    color: "bg-emerald-100/80 text-emerald-800",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Safe",
    description: "Your data is always protected",
    color: "bg-teal-100/80 text-teal-800",
  },
  {
    icon: Leaf,
    title: "Sustainable & Natural",
    description: "Ethically sourced, farm fresh products",
    color: "bg-lime-100/80 text-lime-800",
  },
];

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
    <div className="relative min-h-[92vh] flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#e8eedd]">
      {/* ── Background Landscape Image ── */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/vanom-login-bg.webp')" }}
      />

      {/* ── Soft Natural Vignette Gradient (allows landscape to breathe while keeping card crisp) ── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#dbe5d1]/65 via-[#eaf0e2]/30 to-transparent" />

      <SEO
        title="Create Your Account | Vanom"
        description="Join Vanom to shop premium natural superfoods, ayurvedic herbs, and farm-fresh organic products."
        noindex={true}
      />

      {/* ── Main Two-Column Container (Top-Aligned Matching Reference Design) ── */}
      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* ── Left Column: Value Proposition & Brand Header ── */}
        <div className="lg:col-span-5 space-y-6 lg:space-y-7 pt-1 lg:pt-3">
          {/* Badge: Join Vanom */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-emerald-600/20 text-[#006B3C] text-xs font-bold shadow-xs backdrop-blur-sm">
            <Leaf className="w-3.5 h-3.5 fill-[#006B3C]" />
            <span>Join Vanom</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-[#0f2d1e] tracking-tight leading-[1.08]">
              Create Your <br />
              Account
            </h1>
            <p className="text-sm sm:text-base text-[#244b36] font-medium leading-relaxed max-w-md">
              Sign up for personal shopping, express checkout, and order tracking.
            </p>
          </div>

          {/* 4 Feature Bullet Points */}
          <div className="space-y-4 pt-1 max-w-md">
            {VALUE_PROPOSITIONS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-white/60 ${item.color}`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-[#0f2d1e] leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-xs text-[#355f48] font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Register Form Card ── */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <RegisterFormCard
            formData={formData}
            handleChange={handleChange}
            countriesList={countriesList}
            loading={loading}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
