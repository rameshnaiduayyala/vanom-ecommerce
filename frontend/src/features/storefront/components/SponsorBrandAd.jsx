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
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-gold-500/30 p-8 sm:p-12 text-white shadow-2xl">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#d9a000_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Main Content */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Vanom Commercial Credit & Freight Desk</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Unlock Up to <span className="text-gold-400">$100,000</span> Commercial Credit with <span className="text-emerald-400">NET 30</span> Terms
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verify your Corporate Tax ID in under 2 hours. Order full pallet truckloads with zero upfront payment, dedicated priority dispatch, and automated consolidated tax invoices.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>0% Interest on Net 15/30</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Consolidated Tax / VAT Invoice</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated Freight Logistics</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to={ROUTES.B2B.ROOT}>
                <Button
                  variant="gold"
                  size="lg"
                  icon={Building2}
                  className="font-black text-slate-950 shadow-lg hover:scale-102 transition-transform"
                >
                  Apply for Wholesale Credit
                </Button>
              </Link>
              <Link to={ROUTES.B2B.BULK_ORDER}>
                <Button
                  variant="outline"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="border-slate-700 text-slate-200 hover:bg-slate-900"
                >
                  Try Bulk Order Spreadsheet
                </Button>
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
