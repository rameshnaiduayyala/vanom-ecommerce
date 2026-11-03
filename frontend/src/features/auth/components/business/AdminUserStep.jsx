import React, { useState } from "react";
import { Mail, Phone, Lock, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";

export function AdminUserStep({
  formData,
  handleChange,
  loading,
  onBack,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-3.5 animate-in fade-in-50 duration-150">
      {/* Admin Names */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="e.g. Vikram"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="e.g. Mehta"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>
      </div>

      {/* Corporate Email */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-700">
          Work / Corporate Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="procurement@company.com"
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>
      </div>

      {/* Phone & Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700">Work Phone / Mobile</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555 123 4567"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 py-3.5 px-5 rounded-2xl bg-[#006B3C] hover:bg-[#00522E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#006B3C]/20 transition-all cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <span>Creating Business Account...</span>
          ) : (
            <>
              <span>Complete Business Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AdminUserStep;
