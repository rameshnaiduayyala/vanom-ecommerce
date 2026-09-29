import React from "react";
import { Globe2, ArrowRight } from "lucide-react";

export function BusinessInfoStep({
  formData,
  handleChange,
  countriesList,
  onNext,
}) {
  return (
    <div className="space-y-3 animate-in fade-in-50 duration-150">
      {/* Brand & Legal Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">
            Business / Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="e.g. Pure Organics Ltd"
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">
            Registered Legal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="legalName"
            value={formData.legalName}
            onChange={handleChange}
            placeholder="e.g. Pure Organics Wholesale Pvt Ltd"
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>
      </div>

      {/* Country & Tax ID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">
            Country of Operation / Registry <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Globe2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
            <select
              required
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all cursor-pointer font-medium"
            >
              {countriesList.map((c) => (
                <option key={c.code || c.id} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">GSTIN / VAT / Tax ID</label>
          <input
            type="text"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            placeholder="e.g. 27AAACA1234A1Z1"
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all uppercase"
          />
        </div>
      </div>

      {/* CIN / Business Registration */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#0F2B1C]">CIN / Company Registration Number</label>
        <input
          type="text"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleChange}
          placeholder="e.g. U01100DL2024PTC123456"
          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all uppercase"
        />
      </div>

      {/* Street Address */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#0F2B1C]">
          Principal Business Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          placeholder="Plot, Street, Building, Industrial Hub"
          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
        />
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0F2B1C]">
            Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Postal Code"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
          />
        </div>
      </div>

      {/* Proceed Button */}
      <button
        type="button"
        onClick={onNext}
        className="w-full py-3 px-5 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#00875A]/20 transition-all cursor-pointer mt-2"
      >
        <span>Proceed to Admin Details</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default BusinessInfoStep;
