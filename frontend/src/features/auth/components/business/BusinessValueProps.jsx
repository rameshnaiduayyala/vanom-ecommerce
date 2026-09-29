import React from "react";
import { Percent, Coins, Truck, ShieldCheck, LockKeyhole } from "lucide-react";

export function BusinessValueProps() {
  return (
    <div className="lg:col-span-5 flex flex-col justify-center space-y-5 lg:pr-4">
      <div className="space-y-2.5">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F2B1C] tracking-tight leading-tight">
          Register Your Business on <span className="text-[#00875A]">Vanom</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#5E7D67] leading-relaxed">
          Get direct distributor access to certified organic commodities, essential inventory, pallet freight shipping, and commercial Net-30 invoicing.
        </p>
      </div>

      {/* 3 Value Proposition Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#00875A] flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0F2B1C]">Pallet & Tier Discounts</h4>
            <p className="text-[11px] text-[#5E7D67]">Locked wholesale pricing with bulk MOQs</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7DD] text-[#B87A00] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0F2B1C]">Net-30 / 60 Credit Lines</h4>
            <p className="text-[11px] text-[#5E7D67]">Working capital lines after GST check</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#00875A] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0F2B1C]">Bulk Container Freight</h4>
            <p className="text-[11px] text-[#5E7D67]">Door-to-door logistics & shipping</p>
          </div>
        </div>
      </div>

      {/* Trust guarantees */}
      <div className="flex items-center justify-between text-[11px] text-[#5E7D67] pt-1">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#00875A]" />
          <span>ISO 9001 Quality Assured</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <LockKeyhole className="w-4 h-4 text-[#00875A]" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
}

export default BusinessValueProps;
