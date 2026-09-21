import React from "react";
import { Mail, Phone, Lock, ArrowLeft, ArrowRight } from "lucide-react";

export function AdminUserStep({
  formData,
  handleChange,
  loading,
  onBack,
  onSubmit,
}) {
  return (
    <div className="space-y-3 animate-in fade-in-50 duration-150">
      {/* Admin Names */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="e.g. Vikram"
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="e.g. Mehta"
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>
      </div>

      {/* Corporate Email */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#0F2B1C]">
          Work / Corporate Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
          <input
            type="email"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="procurement@company.com"
            className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>
      </div>

      {/* Phone & Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">Work Phone / Mobile</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555 123 4567"
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">
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
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-4 rounded-xl border border-[#DCE8DF] hover:bg-[#F8FAF9] text-[#0F2B1C] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 py-3 px-5 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#00875A]/20 transition-all cursor-pointer disabled:opacity-70"
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
