import React from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Phone, Globe2, ArrowRight, AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";

export function RegisterFormCard({
  formData,
  handleChange,
  countriesList,
  loading,
  errorMessage,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCE8DF] shadow-xl shadow-emerald-950/[0.04] space-y-4"
    >
      {/* Error Message Text Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed font-medium">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Name Inputs Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0F2B1C]">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="e.g. John"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0F2B1C]">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="e.g. Doe"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
          />
        </div>
      </div>

      {/* Country Select */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0F2B1C]">
          Country / Region <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Globe2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
          <select
            required
            name="countryCode"
            value={formData.countryCode}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all cursor-pointer font-medium"
          >
            {countriesList.map((c) => (
              <option key={c.code || c.id} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0F2B1C]">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
          <input
            type="email"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
          />
        </div>
      </div>

      {/* Mobile Phone */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0F2B1C]">Mobile Phone</label>
        <div className="relative">
          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 555 123 4567"
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0F2B1C]">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
          <input
            type="password"
            required
            minLength={8}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00875A]/20 transition-all cursor-pointer disabled:opacity-70 mt-2"
      >
        {loading ? (
          <span>Creating Account...</span>
        ) : (
          <>
            <span>Create Retail Account</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Switch to Login */}
      <div className="text-center pt-3 border-t border-[#E8EDE9]">
        <p className="text-xs text-[#5E7D67]">
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN} className="text-[#00875A] font-bold hover:underline ml-1">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}

export default RegisterFormCard;
