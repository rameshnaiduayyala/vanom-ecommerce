import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import { toast } from "../../../components/ui/Toast.jsx";
import {
  Boxes,
  Sparkles,
  FileCheck,
  PlaneTakeoff,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

export function CommercialProcurementSection() {
  const [volume, setVolume] = useState("100 - 50,000+ live specimens");
  const [freight, setFreight] = useState("Reefer Ocean Containers or Air Express");
  const [agronomy, setAgronomy] = useState("Dedicated regional trade specialist");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Project Inquiry Received!", "Our Senior Agronomy & Freight desk will contact you within 2 business hours with an itemized proforma.");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer Rounded Container matching Image 2 */}
      <div className="relative rounded-[2.5rem] bg-[#074428] text-white p-7 sm:p-10 lg:p-14 shadow-2xl border border-white/10 overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0e6e43]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#042a19]/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ─── LEFT COLUMN: Enterprise Info & 4 Grid Cards ─── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c5936] text-[#6ee7b7] border border-[#10b981]/30 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>ENTERPRISE WHOLESALE & SUPPLY</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-snug">
              Goods for Every Scale: Commercial & Bulk Procurement
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xl">
              Whether supplying a multi-site retail chain, enterprise hotel franchise, or regional logistics depot, Vanom provides scheduled wholesale contracts, pallet volume supply, and multi-jurisdiction freight.
            </p>

            {/* 4 Feature Cards Grid matching Image 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#0b5030]/80 border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center gap-1 hover:border-[#84CC16]/40 transition-all">
                <span className="text-xs sm:text-sm font-black text-[#84CC16]">Bulk Orders</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-100/70 leading-tight">Pallets to Reefer / FCL</span>
              </div>

              <div className="bg-[#0b5030]/80 border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center gap-1 hover:border-[#84CC16]/40 transition-all">
                <span className="text-xs sm:text-sm font-black text-[#84CC16]">Direct Sourcing</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-100/70 leading-tight">Factory Specifications</span>
              </div>

              <div className="bg-[#0b5030]/80 border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center gap-1 hover:border-[#84CC16]/40 transition-all">
                <span className="text-xs sm:text-sm font-black text-[#84CC16]">Project Quotes</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-100/70 leading-tight">Itemized Proformas & RFQ</span>
              </div>

              <div className="bg-[#0b5030]/80 border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center items-center gap-1 hover:border-[#84CC16]/40 transition-all">
                <span className="text-xs sm:text-sm font-black text-[#84CC16]">Tax Compliant</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-100/70 leading-tight">US Nexus & VAT Cleared</span>
              </div>
            </div>

            {/* Action Buttons matching Image 2 */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={ROUTES.B2B.QUOTES}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#84CC16] hover:bg-[#74B626] text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-[#84CC16]/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Request Project Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={ROUTES.B2B.BULK_ORDER}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-white border border-white/25 hover:bg-white/10 backdrop-blur-sm transition-all hover:border-white/40 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Order Manifest / CSV</span>
              </Link>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Quick RFQ Inquiry White Card matching Image 2 ─── */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-white/20">
              <h3 className="text-lg sm:text-xl font-black text-[#074428] mb-4">
                Quick RFQ Inquiry
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Field 1 */}
                <div className="rounded-xl bg-[#F4F7F4] border border-slate-200/80 p-3.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    1. Volume Requirements:
                  </label>
                  <input
                    type="text"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full mt-1 text-xs text-[#074428] font-bold bg-transparent focus:outline-none"
                  />
                </div>

                {/* Field 2 */}
                <div className="rounded-xl bg-[#F4F7F4] border border-slate-200/80 p-3.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    2. Freight Mode:
                  </label>
                  <input
                    type="text"
                    value={freight}
                    onChange={(e) => setFreight(e.target.value)}
                    className="w-full mt-1 text-xs text-[#074428] font-bold bg-transparent focus:outline-none"
                  />
                </div>

                {/* Field 3 */}
                <div className="rounded-xl bg-[#F4F7F4] border border-slate-200/80 p-3.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    3. Trade Specialist Assignment:
                  </label>
                  <input
                    type="text"
                    value={agronomy}
                    onChange={(e) => setAgronomy(e.target.value)}
                    className="w-full mt-1 text-xs text-[#074428] font-bold bg-transparent focus:outline-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 rounded-xl bg-[#074428] hover:bg-[#0a5634] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#84CC16]" />
                      <span>Inquiry Dispatched!</span>
                    </>
                  ) : (
                    <span>Submit Procurement Inquiry</span>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
