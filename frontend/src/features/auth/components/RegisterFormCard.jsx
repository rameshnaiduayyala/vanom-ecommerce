import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  Globe2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { ROUTES } from "@/constants/routes.js";

export function RegisterFormCard({
  formData,
  handleChange,
  countriesList,
  loading,
  errorMessage,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  return (
    <div className="bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-9 shadow-2xl shadow-emerald-950/15 border border-slate-100 max-w-xl w-full">
      {/* ── Top Account Type Switcher (Retail Customer vs Business / Wholesale) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Active: Retail Customer */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-[#006B3C] flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006B3C] flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                Retail Customer
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                For personal shopping
              </p>
            </div>
          </div>
          <div className="w-5 h-5 rounded-full bg-[#006B3C] text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        </div>

        {/* Inactive / Link: Business / Wholesale */}
        <Link
          to={ROUTES.REGISTER_BUSINESS}
          className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200 transition-all flex items-center justify-between gap-3 group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 group-hover:text-[#006B3C] flex items-center justify-center shrink-0 transition-colors shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate group-hover:text-[#006B3C] transition-colors">
                Business / Wholesale
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                For stores, distributors & bulk orders
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Form Section Header ── */}
      <div className="mb-5 space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Create Retail Account
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Join Vanom and start shopping your favorite natural products.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Error Message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}

        {/* ── First Name & Last Name ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              First Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. John"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006B3C] focus:ring-2 focus:ring-[#006B3C]/15 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Doe"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006B3C] focus:ring-2 focus:ring-[#006B3C]/15 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* ── Email Address & Country/Region ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006B3C] focus:ring-2 focus:ring-[#006B3C]/15 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Country / Region <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Globe2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                required
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#006B3C] focus:ring-2 focus:ring-[#006B3C]/15 transition-all cursor-pointer font-medium appearance-none"
              >
                {countriesList.map((c) => (
                  <option key={c.code || c.id} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Mobile Phone & Password ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Mobile Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555 123 4567"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006B3C] focus:ring-2 focus:ring-[#006B3C]/15 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006B3C] focus:ring-2 focus:ring-[#006B3C]/15 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Terms & Conditions Checkbox ── */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            className="w-4 h-4 rounded text-[#006B3C] focus:ring-[#006B3C] cursor-pointer border-slate-300"
          />
          <label htmlFor="agreeTerms" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
            I agree to the{" "}
            <Link to="/terms" target="_blank" className="font-bold text-[#006B3C] hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy" target="_blank" className="font-bold text-[#006B3C] hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* ── Main Submit Button ── */}
        <button
          type="submit"
          disabled={loading || !agreeTerms}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#006B3C] hover:bg-[#00552F] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#006B3C]/20 hover:shadow-lg hover:shadow-[#006B3C]/30 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:pointer-events-none mt-2"
        >
          {loading ? (
            <span>Creating Account...</span>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span>Create Retail Account</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        {/* ── Divider 'or' ── */}
        {/* <div className="relative py-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400">
            or
          </span>
        </div> */}

        {/* ── Switch to Login ── */}
        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-600 font-medium">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="text-[#006B3C] font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterFormCard;
