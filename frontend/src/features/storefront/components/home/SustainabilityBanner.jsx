import React from "react";
import { Leaf, Recycle, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PILLARS = [
  { icon: Leaf, label: "Eco-Friendly Products", color: "#006B3C" },
  { icon: Recycle, label: "Reduced Waste", color: "#D9A514" },
  { icon: Globe, label: "Greater Planet", color: "#0369A1" },
];

export function SustainabilityBanner() {
  return (
    <section
      className="py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #003D2B 0%, #006B3C 100%)" }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Sustainable Choices<br />
              <span className="text-[#D9A514]">for a Better Tomorrow</span>
            </h2>
            <p className="text-emerald-200 text-sm max-w-md">
              Eco-friendly products for a cleaner, greener planet
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#D9A514] hover:bg-[#c49010] text-[#003D2B] font-bold px-6 py-2.5 rounded-full text-xs mt-4 transition-all active:scale-95"
            >
              Shop Sustainable <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar Icons */}
          <div className="flex flex-wrap sm:flex-col gap-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.label} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5 min-w-[160px]">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${pillar.color}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: pillar.color }} />
                  </div>
                  <span className="text-white text-xs font-semibold">{pillar.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SustainabilityBanner;
