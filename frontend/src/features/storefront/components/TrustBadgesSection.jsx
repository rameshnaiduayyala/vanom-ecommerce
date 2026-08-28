import React from "react";
import { Truck, ShieldCheck, Layers, CreditCard, Clock, Award } from "lucide-react";

const ASSURANCES = [
  {
    icon: Truck,
    title: "Global & Domestic Freight",
    description: "30+ countries · Express & pallet logistics",
    color: "bg-blue-600",
  },
  {
    icon: Layers,
    title: "Wholesale Volume Tiers",
    description: "Up to 35% off on bulk pallet orders",
    color: "bg-amber-500",
  },
  {
    icon: ShieldCheck,
    title: "Multi-Tax Compliant",
    description: "GST · HMRC VAT · US State Nexus",
    color: "bg-emerald-600",
  },
  {
    icon: CreditCard,
    title: "Encrypted Payments",
    description: "UPI · Stripe · NET 30 credit terms",
    color: "bg-purple-600",
  },
];

const STATS = [
  { value: "50K+", label: "Active Buyers" },
  { value: "30+", label: "Countries" },
  { value: "1,200+", label: "SKUs" },
  { value: "₹2Cr+", label: "Daily GMV" },
  { value: "99.7%", label: "Dispatch SLA" },
];

export function TrustBadgesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      {/* Trust strip — 4 horizontal pillars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border border border-border rounded-2xl bg-white overflow-hidden shadow-xs">
        {ASSURANCES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3.5 px-5 py-4 hover:bg-surface-muted/50 transition-colors">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary truncate">{item.title}</p>
                <p className="text-[11px] text-text-muted leading-tight mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-around px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800">
        {STATS.map((stat, i) => (
          <React.Fragment key={i}>
            <div className="text-center">
              <div className="text-lg font-black text-white leading-tight">{stat.value}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
            {i < STATS.length - 1 && <div className="w-px h-8 bg-slate-800" />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
