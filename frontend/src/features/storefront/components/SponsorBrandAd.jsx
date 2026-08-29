import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export function SponsorBrandAd() {
  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#001E3D] border border-[#003876] p-7 sm:p-10 text-white shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#FFE000]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Main Content */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-[#FFE000] text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vanom Commercial Credit & Freight Desk</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Unlock Up to <span className="text-[#FFE000]">$100,000</span> Commercial Credit with <span className="text-emerald-400">NET 30</span> Terms
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verify your Corporate Tax ID in under 2 hours. Order full pallet truckloads with zero upfront payment, dedicated priority dispatch, and automated consolidated tax invoices.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>0% Interest on Net 15/30</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Consolidated VAT / Tax Invoice</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Priority Pallet Logistics</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link to={ROUTES.B2B.ROOT}>
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FFE000] text-[#003876] text-xs font-black hover:bg-[#FFD100] transition-colors cursor-pointer shadow-md">
                  <Building2 className="w-4 h-4" />
                  Apply for Wholesale Credit
                </button>
              </Link>
              <Link to={ROUTES.B2B.BULK_ORDER}>
                <button className="flex items-center gap-2 px-5 py-3 rounded-lg border border-white/20 text-white text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer">
                  <span>Bulk Order Sheet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Right Showcase Box */}
          <div className="lg:col-span-4">
            <div className="p-6 rounded-2xl bg-[#001730]/90 border border-white/15 backdrop-blur-xl shadow-lg space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Corporate Verification</span>
                    <span className="text-[10px] text-slate-400">Tax ID Compliant</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Credit Limit</span>
                  <strong className="text-white font-black">$100,000.00</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Payment Term</span>
                  <strong className="text-[#FFE000] font-black">NET 30 Invoicing</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Logistics SLA</span>
                  <strong className="text-emerald-400 font-black">24-Hr Pallet Dispatch</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SponsorBrandAd;
