import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import { ArrowRight, Boxes, CookingPot, ShieldCheck, Sparkles } from "lucide-react";

const BANNERS = [
  {
    id: "packaging",
    tag: "TOP DEAL",
    category: "Packaging & Logistics",
    icon: Boxes,
    title: "Heavy-Duty Corrugated Cartons & Pallet Wrap",
    description: "Save up to 35% on full bundle & pallet orders. Drop-tested commercial standard.",
    pricePrefix: "Starting at",
    price: "$16.50",
    originalPrice: "$24.99",
    savings: "SAVE $8.49",
    href: `${ROUTES.PRODUCTS}?category=cat-3`,
    cta: "Shop Packaging Deals",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    gradient: "bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white",
    border: "border-blue-200/80 hover:border-blue-400",
    tagColor: "bg-[#003876] text-white",
    glowColor: "bg-blue-400/10",
  },
  {
    id: "appliances",
    tag: "SPECIAL BUY",
    category: "Commercial Kitchen & Catering",
    icon: CookingPot,
    title: "3500W High-Capacity Commercial Induction Burners",
    description: "Heavy stainless-steel with 24/7 continuous duty cycle for restaurants & catering.",
    pricePrefix: "Wholesale Price",
    price: "$85.00",
    originalPrice: "$120.00",
    savings: "SAVE $35.00",
    href: `${ROUTES.PRODUCTS}?category=cat-4`,
    cta: "Shop Kitchen Deals",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
    gradient: "bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-white",
    border: "border-amber-200/80 hover:border-amber-400",
    tagColor: "bg-amber-600 text-white",
    glowColor: "bg-amber-400/10",
  },
];

export function DualPromoBanners() {
  return (
    <section className="w-full">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#003876]/10 text-[#003876] px-2 py-0.5 rounded">
              Limited Time
            </span>
            <span className="text-xs text-slate-500 font-medium">Direct Pallet & Consignment Deals</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Featured Deals & Offers
          </h2>
        </div>
        <Link
          to={ROUTES.PRODUCTS}
          className="text-xs sm:text-sm font-bold text-[#003876] hover:underline whitespace-nowrap flex items-center gap-1"
        >
          View all Offers
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Gradient-Enhanced BestBuy Deal Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BANNERS.map((b) => (
          <div
            key={b.id}
            className={`group relative overflow-hidden rounded-2xl ${b.gradient} border ${b.border} shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-7`}
          >
            {/* Subtle atmospheric glow */}
            <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full ${b.glowColor} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

            {/* Top row: Tag + Category */}
            <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
              <span className={`text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md uppercase shadow-2xs ${b.tagColor}`}>
                {b.tag}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-200/60">
                <b.icon className="w-3.5 h-3.5 text-[#003876]" />
                {b.category}
              </span>
            </div>

            {/* Middle: Text + Image */}
            <div className="relative z-10 flex items-start gap-4 mb-5">
              <div className="flex-1 space-y-2">
                <h3 className="text-base sm:text-lg font-black text-slate-950 leading-snug group-hover:text-[#003876] transition-colors">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {b.description}
                </p>

                {/* Price block */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    {b.pricePrefix}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-950">
                      {b.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through font-medium">
                      {b.originalPrice}
                    </span>
                    <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded shadow-2xs">
                      {b.savings}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Image Thumbnail with white gradient frame */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-white border border-slate-200/80 p-2 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs group-hover:shadow-md transition-shadow">
                <img
                  src={b.image}
                  alt={b.title}
                  className="max-h-full max-w-full object-cover rounded-lg group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Bottom Button Row */}
            <div className="relative z-10 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified In Stock · Same-Day Dispatch
              </span>

              <Link to={b.href}>
                <button className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] text-xs font-black transition-all cursor-pointer active:scale-98 shadow-sm hover:shadow-md">
                  <span>{b.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DualPromoBanners;
