import React from "react";
import { Truck, Layers, ShieldCheck, CreditCard, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";

const PILLARS = [
  {
    icon: Truck,
    title: "Free Freight $2,999+",
    desc: "24-hr pallet dispatch",
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Layers,
    title: "Wholesale Tiers",
    desc: "Up to 35% bulk savings",
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: ShieldCheck,
    title: "ISO 9001:2015",
    desc: "GST & VAT tax compliant",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: CreditCard,
    title: "NET 30 Terms",
    desc: "$100K commercial credit",
    accent: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

export function TrustBadgesSection() {
  return (
    <section className="w-full">
      {/* ── Single Smart Ultra-Compact 4-Pillar Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center">
        {PILLARS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 sm:px-4 sm:py-3 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-[#003876]/30 hover:shadow-sm transition-all duration-200 group"
            >
              <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-4 h-4 ${item.accent} stroke-[2.2]`} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-900 group-hover:text-[#003876] transition-colors truncate leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrustBadgesSection;
