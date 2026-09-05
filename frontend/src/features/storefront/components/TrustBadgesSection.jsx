import React from "react";
import { Truck, ShieldCheck, Layers, CreditCard, Clock, Award } from "lucide-react";

const ASSURANCES = [
  {
    icon: Truck,
    title: "Global & Domestic Freight",
    description: "30+ countries · Express & pallet freight logistics",
    color: "bg-emerald-100 text-[#074428] border border-emerald-200",
  },
  {
    icon: Layers,
    title: "Wholesale Volume Tiers",
    description: "Up to 35% off on bulk pallet & case orders",
    color: "bg-lime-100 text-[#65A30D] border border-lime-200",
  },
  {
    icon: ShieldCheck,
    title: "Multi-Tax Compliant",
    description: "HMRC VAT & US State Nexus Sales Tax cleared",
    color: "bg-emerald-100 text-[#074428] border border-emerald-200",
  },
  {
    icon: CreditCard,
    title: "Enterprise Terms",
    description: "Stripe secure & NET 30 commercial credit lines",
    color: "bg-emerald-100 text-[#074428] border border-emerald-200",
  },
];

const STATS = [
  { value: "50K+", label: "Active Buyers" },
  { value: "30+", label: "Countries Served" },
  { value: "1,200+", label: "Commercial SKUs" },
  { value: "$2.5M+", label: "Monthly GMV" },
  { value: "99.7%", label: "Dispatch SLA" },
];

export function TrustBadgesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      {/* Trust strip — 4 horizontal pillars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DCE8DF] border border-[#DCE8DF] rounded-3xl bg-white overflow-hidden shadow-xs">
        {ASSURANCES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3.5 px-6 py-5 hover:bg-[#F2F7F4] transition-colors">
              <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center shrink-0 shadow-2xs`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#072115] truncate">{item.title}</p>
                <p className="text-[11px] text-[#4B6357] leading-tight mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats bar in rich botanical dark green */}
      <div className="flex flex-wrap items-center justify-around gap-4 px-6 sm:px-8 py-5 rounded-3xl bg-[#074428] border border-emerald-800/80 shadow-md">
        {STATS.map((stat, i) => (
          <React.Fragment key={i}>
            <div className="text-center min-w-[120px]">
              <div className="text-xl sm:text-2xl font-black text-[#84CC16] tracking-tight">{stat.value}</div>
              <div className="text-[10px] sm:text-[11px] text-emerald-100/75 uppercase tracking-wider font-semibold mt-0.5">{stat.label}</div>
            </div>
            {i < STATS.length - 1 && <div className="hidden md:block w-px h-8 bg-emerald-800/80" />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
