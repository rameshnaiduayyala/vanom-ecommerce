import React from "react";
import { CheckCircle2, Lock, RotateCcw, Truck, Headphones } from "lucide-react";

export function StoreTrustBadges() {
  const badges = [
    { title: "100% Genuine", desc: "Products", icon: CheckCircle2 },
    { title: "Secure", desc: "Payments", icon: Lock },
    { title: "Easy", desc: "Returns", icon: RotateCcw },
    { title: "Fast & Reliable", desc: "Delivery", icon: Truck },
    { title: "Dedicated", desc: "Customer Support", icon: Headphones },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6 border-t border-gray-200">
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs"
          >
            <div className="w-10 h-10 rounded-full bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">{badge.title}</h4>
              <p className="text-[11px] text-gray-500 leading-tight">{badge.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StoreTrustBadges;
