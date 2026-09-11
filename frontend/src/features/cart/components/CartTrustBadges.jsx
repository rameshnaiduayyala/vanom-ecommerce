import React from "react";
import { ShieldCheck, Lock, Truck } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, color: "text-[#067d62]", text: "100% Genuine Organic Certified Products" },
  { icon: Lock,        color: "text-[#007185]", text: "256-Bit Bank-Grade Encrypted Checkout"   },
  { icon: Truck,       color: "text-[#FF9900]", text: "Express Dispatched with Live Tracking"   },
];

export function CartTrustBadges() {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-3">
      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
        Vanom Buyer Assurance
      </h4>
      <div className="space-y-2.5 text-xs text-text-secondary">
        {BADGES.map(({ icon: Icon, color, text }) => (
          <div key={text} className="flex items-center gap-2.5">
            <Icon className={`w-4 h-4 ${color} shrink-0`} />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
