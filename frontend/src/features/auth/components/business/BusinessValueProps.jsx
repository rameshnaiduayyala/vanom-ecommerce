import React from "react";
import { Percent, Coins, Truck, ShieldCheck, Building2, Leaf } from "lucide-react";

const BUSINESS_VALUE_PROPS = [
  {
    icon: Percent,
    title: "Pallet & Tier Wholesale Pricing",
    description: "Locked commercial pricing with bulk container volume tiers",
    color: "bg-emerald-100/80 text-emerald-800",
  },
  {
    icon: Coins,
    title: "Net-30 / 60 Commercial Credit",
    description: "Flexible working capital credit lines for approved businesses",
    color: "bg-amber-100/80 text-amber-800",
  },
  {
    icon: Truck,
    title: "Bulk Container & Freight Shipping",
    description: "Door-to-door pallet logistics across global ports & warehouses",
    color: "bg-teal-100/80 text-teal-800",
  },
  {
    icon: ShieldCheck,
    title: "Dedicated B2B Account Manager",
    description: "Direct wholesale quote desk, priority procurement & support",
    color: "bg-lime-100/80 text-lime-800",
  },
];

export function BusinessValueProps() {
  return (
    <div className="lg:col-span-5 space-y-6 lg:space-y-7 pt-1 lg:pt-3">
      {/* Badge: B2B Wholesale Portal */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-emerald-600/20 text-[#006B3C] text-xs font-bold shadow-xs backdrop-blur-sm">
        <Building2 className="w-3.5 h-3.5 text-[#006B3C]" />
        <span>B2B Wholesale Portal</span>
      </div>

      {/* Heading */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black text-[#0f2d1e] tracking-tight leading-[1.08]">
          Register Your <br />
          Business
        </h1>
        <p className="text-sm sm:text-base text-[#244b36] font-medium leading-relaxed max-w-md">
          Get direct distributor access to certified organic commodities, pallet freight logistics, and commercial Net-30 invoicing.
        </p>
      </div>

      {/* 4 Feature Bullet Points */}
      <div className="space-y-4 pt-1 max-w-md">
        {BUSINESS_VALUE_PROPS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-white/60 ${item.color}`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-[#0f2d1e] leading-snug">
                  {item.title}
                </h2>
                <p className="text-xs text-[#355f48] font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BusinessValueProps;
