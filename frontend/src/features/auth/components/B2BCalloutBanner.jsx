import React from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowRight, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";

export function B2BCalloutBanner() {
  return (
    <Link
      to={ROUTES.REGISTER_BUSINESS}
      className="group block p-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-400/30 hover:border-emerald-400/60 transition-all shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-[#00875A] text-white flex items-center justify-center shadow-md shadow-emerald-950/40 shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              Buying for a Business or Store?
              <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                Wholesale
              </span>
            </h3>
            <p className="text-[11px] text-emerald-100/70">
              Register company for pallet pricing & Net-30 credit
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0" />
      </div>
    </Link>
  );
}

export default B2BCalloutBanner;
