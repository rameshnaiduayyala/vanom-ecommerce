import React from "react";
import {
  Layers,
  Percent,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Headphones,
} from "lucide-react";

const WHY_VANOM = [
  { icon: Layers, label: "Wide Selection", subtext: "All your needs" },
  { icon: Percent, label: "Best Prices", subtext: "Great value" },
  { icon: ShieldCheck, label: "Trusted Brands", subtext: "Genuine products" },
  { icon: Truck, label: "Fast & Reliable", subtext: "Delivery across India" },
  { icon: RotateCcw, label: "Easy Returns", subtext: "Hassle-free" },
  { icon: CreditCard, label: "Secure Payments", subtext: "100% safe" },
  { icon: Headphones, label: "24/7 Support", subtext: "We're here to help" },
];

export function WhyVanomSection({ className = "" }) {
  return (
    <section className={`py-10 bg-white/60 border-t border-[#ebdcb0]/50 ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-6">
          Why Choose Vanom
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {WHY_VANOM.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#fafcfb] border border-gray-100/80 hover:border-[#006B3C]/30 hover:bg-[#EAF7F0]/40 transition-all cursor-default"
              >
                <div className="w-10 h-10 rounded-full bg-[#EAF7F0] flex items-center justify-center shrink-0 shadow-2xs">
                  <Icon className="w-5 h-5 text-[#006B3C]" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{item.label}</p>
                  <p className="text-[10px] text-gray-500 truncate">{item.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyVanomSection;

