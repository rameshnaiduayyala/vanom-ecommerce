import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { Building2, User, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const [customerType, setCustomerType] = useState("B2C");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await Api.auth.register({
        ...formData,
        customerType,
      });

      login(data.user, data.tokens);
      addToast({
        title: "Account Created!",
        message: `Welcome to Vanom, ${data.user.firstName}!`,
        type: "success",
      });

      if (customerType === "B2B") {
        navigate(ROUTES.B2B.COMPANY_PROFILE);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      addToast({
        title: "Registration Failed",
        message: err.message || "Failed to create account",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#ededed] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to={ROUTES.HOME} className="inline-block">
            <img
              src="/logo.png"
              alt="Vanom"
              className="h-12 w-auto object-contain mx-auto mb-1 hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Join thousands of retail and commercial buyers
          </p>
        </div>

        {/* Account Type Selector Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <span className="text-[10px] font-black text-[#003876] uppercase tracking-widest block">
            Choose Purchasing Model
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setCustomerType("B2C")}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                customerType === "B2C"
                  ? "border-[#003876] bg-blue-50/70 shadow-2xs ring-1 ring-[#003876]"
                  : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <User className="w-4 h-4 text-[#003876]" />
                <span>B2C Retail</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-tight">Individual orders & doorstep delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setCustomerType("B2B")}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                customerType === "B2B"
                  ? "border-amber-500 bg-amber-50/70 shadow-2xs ring-1 ring-amber-500"
                  : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>B2B Wholesale</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-tight">Pallets, tax invoices & credit lines</span>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                placeholder="John"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                placeholder="Doe"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] text-sm font-black transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : `Create ${customerType === "B2B" ? "Wholesale" : "Retail"} Account`}
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-medium">Already have an account?</span>
            </div>
          </div>

          {/* Sign In CTA */}
          <Link to={ROUTES.LOGIN}>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl border-2 border-[#003876] text-[#003876] hover:bg-[#003876] hover:text-white text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Sign In Instead
            </button>
          </Link>
        </form>

        {/* Security Assurances */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-medium pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Multi-Tax Compliant
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Instant PO Setup
          </span>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
