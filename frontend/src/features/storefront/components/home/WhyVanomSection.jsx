import React from "react";
import { ShieldCheck, Globe, RefreshCw, Zap, Package, CreditCard, HeadphonesIcon } from "lucide-react";

const WHY_VANOM = [
  { icon: Package, label: "Wide Selection", subtext: "1200+ SKUs across categories" },
  { icon: Zap, label: "Best Prices", subtext: "Guaranteed lowest prices" },
  { icon: ShieldCheck, label: "Trusted Brands", subtext: "Only genuine products" },
  { icon: Globe, label: "Fast & Reliable", subtext: "Delivery across India" },
  { icon: RefreshCw, label: "Easy Returns", subtext: "Hassle-free 10-day returns" },
  { icon: CreditCard, label: "Secure Payments", subtext: "100% safe & encrypted" },
  { icon: HeadphonesIcon, label: "24/7 Support", subtext: "We're here to help" },
];

export function WhyVanomSection() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">Why Choose Vanom</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {WHY_VANOM.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-[#006B3C]/30 hover:bg-[#EAF7F0]/50 transition-all cursor-default"
              >
                <div className="w-10 h-10 rounded-full bg-[#EAF7F0] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#006B3C]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{item.label}</p>
                  <p className="text-[10px] text-gray-500">{item.subtext}</p>
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
