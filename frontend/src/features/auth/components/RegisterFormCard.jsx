import React from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Phone, Globe2, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";

export function RegisterFormCard({
  formData,
  handleChange,
  countriesList,
  loading,
  errorMessage,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      {/* Outer Glow / Ambient Lighting */}
      <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent blur-xl pointer-events-none" />

      <form
        onSubmit={onSubmit}
        className="relative p-6 sm:p-9 rounded-[28px] bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl shadow-emerald-950/20 space-y-4"
      >
        {/* Error Message Text Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed font-semibold">
              {errorMessage}
            </div>
          </div>
        )}

        {/* ── Row 1: First Name & Last Name ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 tracking-tight">
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. John"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 tracking-tight">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Doe"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* ── Row 2: Email Address & Country/Region ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 tracking-tight">
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
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 tracking-tight">
              Country / Region <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Globe2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                required
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all cursor-pointer font-medium"
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

        {/* ── Row 3: Mobile Phone & Password ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 tracking-tight">Mobile Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555 123 4567"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 tracking-tight">
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
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all font-medium"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00875A]/25 hover:shadow-xl hover:shadow-[#00875A]/35 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:pointer-events-none mt-2"
        >
          {loading ? (
            <span className="font-bold">Creating Account...</span>
          ) : (
            <>
              <span>Create Retail Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Switch to Login */}
        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="text-[#00875A] font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterFormCard;
