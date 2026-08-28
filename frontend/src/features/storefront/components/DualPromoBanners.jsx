import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import { ArrowRight, Boxes, CookingPot, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";

export function DualPromoBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ad Banner 1: Logistics & Master Packaging */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 p-8 text-white flex flex-col justify-between min-h-[280px] shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80"
            alt="Packaging Depot"
            className="absolute -right-10 -bottom-10 w-64 h-64 object-cover rounded-full opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700 pointer-events-none"
          />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider">
              <Boxes className="w-3.5 h-3.5" />
              <span>Packaging & Logistics Mega Depot</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white max-w-sm">
              3-Ply Heavy-Duty Shipping Boxes & Wrap Films
            </h3>

            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Tier 3 wholesale volume discount unlocked starting at 80 bundles with full pallet strapping.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Starting from</span>
              <span className="text-lg font-black text-gold-400">₹950 / bundle</span>
            </div>

            <Link to={`${ROUTES.PRODUCTS}?category=cat-3`}>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                className="font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Shop Packaging
              </Button>
            </Link>
          </div>
        </div>

        {/* Ad Banner 2: Commercial Kitchen & Foodservice */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 border border-amber-500/30 p-8 text-white flex flex-col justify-between min-h-[280px] shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80"
            alt="Kitchen Appliances"
            className="absolute -right-10 -bottom-10 w-64 h-64 object-cover rounded-full opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700 pointer-events-none"
          />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider">
              <CookingPot className="w-3.5 h-3.5" />
              <span>Commercial Kitchen & Catering</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white max-w-sm">
              3500W High-Capacity Commercial Induction Burners
            </h3>

            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Heavy stainless-steel construction with continuous 24/7 duty cycle for restaurants and cloud kitchens.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Commercial Price</span>
              <span className="text-lg font-black text-amber-400">₹4,300 (Wholesale)</span>
            </div>

            <Link to={`${ROUTES.PRODUCTS}?category=cat-4`}>
              <Button
                variant="gold"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                className="font-bold text-slate-950 shadow-sm"
              >
                Shop Appliances
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
