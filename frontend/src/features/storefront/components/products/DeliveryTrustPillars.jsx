import React from "react";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

export function DeliveryTrustPillars({
  deliveryInfo = "Free Delivery",
  returnPolicy = "7 Days Easy Returns",
  warrantyInfo = "1 Year Brand Warranty",
}) {
  const pillars = [
    {
      title: "Free Delivery",
      desc: deliveryInfo,
      icon: Truck,
    },
    {
      title: "Return Policy",
      desc: returnPolicy,
      icon: RotateCcw,
    },
    {
      title: "Warranty",
      desc: warrantyInfo,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {pillars.map((p, idx) => {
        const Icon = p.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-3 border border-gray-200/80 flex items-center gap-2.5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-gray-900 leading-tight">{p.title}</h4>
              <p className="text-[10px] text-gray-500 leading-tight truncate">{p.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DeliveryTrustPillars;
