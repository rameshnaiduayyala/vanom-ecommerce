import React from "react";
import { Truck, ShieldCheck, Layers, CreditCard, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const PILLARS = [
  {
    icon: Truck,
    title: "Global & Domestic Freight",
    description: "30+ countries · Express & pallet logistics",
  },
  {
    icon: Layers,
    title: "Wholesale Volume Tiers",
    description: "Up to 35% off on bulk pallet orders",
  },
  {
    icon: ShieldCheck,
    title: "Multi-Tax Compliant",
    description: "GST · HMRC VAT · US State Nexus",
  },
  {
    icon: CreditCard,
    title: "Encrypted Payments",
    description: "UPI · Stripe · NET 30 credit terms",
  },
];

const STATS = [
  { value: "50K+", label: "Active Buyers" },
  { value: "30+", label: "Countries" },
  { value: "1,200+", label: "SKUs" },
  { value: "$2.5M+", label: "Daily GMV" },
  { value: "99.7%", label: "Dispatch SLA" },
];

export function TrustBadgesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
      {/* Enterprise Pillar Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
        {PILLARS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-4 h-4 text-slate-700 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Corporate Stats Bar */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-4 rounded-xl bg-slate-950 border border-slate-800">
        <div className="flex items-center gap-0 flex-1 justify-around">
          {STATS.map((stat, i) => (
            <React.Fragment key={i}>
              <div className="text-center px-2">
                <div className="text-base sm:text-lg font-black text-white leading-tight tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                  {stat.label}
                </div>
              </div>
              {i < STATS.length - 1 && (
                <div className="w-px h-7 bg-slate-800 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        <Link
          to="/b2b"
          className="hidden lg:flex items-center gap-1.5 ml-6 text-[11px] font-bold text-slate-400 hover:text-white transition-colors whitespace-nowrap shrink-0 group"
        >
          <span>Open Wholesale Account</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
