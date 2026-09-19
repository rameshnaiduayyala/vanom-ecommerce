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
    <div className="grid grid-cols-3 gap-2.5 py-2">
      {pillars.map((p, idx) => {
        const Icon = p.icon;
        return (
          <div
            key={idx}
            className="bg-[#F8FAF9] rounded-xl p-3 border border-gray-200/80 flex items-center gap-2.5 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-full bg-[#003D2B] text-white flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[#dff0d8]" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-900">{p.title}</h4>
              <p className="text-[10px] text-gray-500 leading-tight">{p.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DeliveryTrustPillars;
