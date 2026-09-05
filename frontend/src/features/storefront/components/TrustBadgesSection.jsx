import React from "react";
import { Truck, ShieldCheck, CreditCard, Award } from "lucide-react";

const ASSURANCES = [
  {
    icon: Truck,
    title: "Express Delivery",
    description: "Fast doorstep delivery across US, UK & worldwide",
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    description: "100% authentic products backed by warranty",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Pricing",
    description: "Clear checkout with local taxes included",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Encrypted Stripe, cards & digital wallet payments",
  },
];

const STATS = [
  { value: "50K+", label: "Active Buyers" },
  { value: "30+", label: "Countries" },
  { value: "1,200+", label: "Products" },
  { value: "99.7%", label: "On-Time Dispatch" },
];

export function TrustBadgesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      {/* Trust strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8EDE9] border border-[#E8EDE9] rounded-2xl bg-white overflow-hidden">
        {ASSURANCES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3.5 px-6 py-5 hover:bg-[#FAFCFA] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#F0F7F1] text-[#074428] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#0F2B1C]">{item.title}</p>
                <p className="text-[11px] text-[#8B9E91] leading-tight mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-around gap-6 px-6 sm:px-8 py-5 rounded-2xl bg-[#0F2B1C]">
        {STATS.map((stat, i) => (
          <React.Fragment key={i}>
            <div className="text-center min-w-[100px]">
              <div className="text-xl font-bold text-[#84CC16] tracking-tight">{stat.value}</div>
              <div className="text-[10px] text-white/35 uppercase tracking-wider font-medium mt-0.5">{stat.label}</div>
            </div>
            {i < STATS.length - 1 && <div className="hidden md:block w-px h-8 bg-white/[0.08]" />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
