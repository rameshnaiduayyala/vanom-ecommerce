import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";

export function SponsorBrandAd() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#074428] border border-emerald-700/40 p-8 sm:p-12 text-white shadow-2xl">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#84CC16]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Main Content */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0c5936] text-[#A3E635] border border-[#84CC16]/30 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>Vanom Commercial Credit & Freight Desk</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Unlock Up to <span className="text-[#84CC16]">$100,000</span> Commercial Credit with <span className="text-[#4ADE80]">NET 30</span> Terms
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Verify your Corporate Tax ID in under 2 hours. Order full pallet truckloads with zero upfront payment, dedicated priority dispatch, and automated consolidated tax invoices.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
                <span>0% Interest on Net 15/30</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
                <span>Consolidated Tax / VAT Invoice</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
                <span>Dedicated Freight Logistics</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to={ROUTES.B2B.ROOT}>
                <button
                  className="px-6 py-3.5 rounded-xl bg-[#84CC16] hover:bg-[#74B626] text-slate-950 font-black text-sm shadow-lg hover:scale-102 transition-transform inline-flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Apply for Wholesale Credit</span>
                </button>
              </Link>
              <Link to={ROUTES.B2B.BULK_ORDER}>
                <button
                  className="px-6 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Try Bulk Order Spreadsheet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Right Showcase Box */}
          <div className="lg:col-span-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Corporate Verification</span>
                    <span className="text-[10px] text-slate-400">Tax ID Compliant</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Credit Approved</span>
                  <strong className="text-white">$100,000.00</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Payment Term</span>
                  <strong className="text-gold-400">NET 30 Invoicing</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Logistics SLA</span>
                  <strong className="text-emerald-400">24-Hr Pallet Dispatch</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
