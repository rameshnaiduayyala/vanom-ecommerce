import React from "react";
import { Truck, ShieldCheck, Layers, CreditCard } from "lucide-react";

export function TrustBadgesSection() {
  const assurances = [
    {
      icon: Truck,
      title: "Global & Domestic Freight",
      description: "Express doorstep parcel delivery and palletized logistics across India, US, and UK.",
    },
    {
      icon: Layers,
      title: "Wholesale Quantity Tiers",
      description: "Authoritative volume brackets with automated savings for sacks, bundles, and full pallets.",
    },
    {
      icon: ShieldCheck,
      title: "Authoritative Multi-Tax Engine",
      description: "Jurisdiction-verified 18% GST (HSN), UK VAT, and US state sales tax calculations.",
    },
    {
      icon: CreditCard,
      title: "Encrypted Multi-Currency Pay",
      description: "Instant UPI, Cards, NetBanking, Stripe, and NET 30 commercial invoice credit terms.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 bg-white rounded-3xl border border-border shadow-xs">
        {assurances.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-start gap-4 p-2">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
                  {item.title}
                </h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
