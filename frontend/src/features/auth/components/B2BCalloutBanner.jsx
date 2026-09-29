import React from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";

export function B2BCalloutBanner() {
  return (
    <Link
      to={ROUTES.REGISTER_BUSINESS}
      className="group block p-4 rounded-2xl bg-gradient-to-r from-[#E6F4EA] to-[#DCF0E2] border border-[#00875A]/20 hover:border-[#00875A]/40 transition-all shadow-xs"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#00875A] flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F2B1C] flex items-center gap-1.5">
              Buying for a Business or Store?
              <span className="text-[10px] bg-[#00875A] text-white px-2 py-0.5 rounded-full font-bold">
                Wholesale
              </span>
            </h3>
            <p className="text-[11px] text-[#5E7D67]">
              Register company for pallet pricing & Net-30 credit
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[#00875A] group-hover:translate-x-1 transition-transform shrink-0" />
      </div>
    </Link>
  );
}

export default B2BCalloutBanner;
