import React from "react";

const STATS_DATA = [
  {
    value: "50K+",
    label: "Active Buyers",
    description: "Satisfied direct retail customers and verified commercial enterprise procurement accounts.",
  },
  {
    value: "30+",
    label: "Countries Served",
    description: "International distribution with express multi-market customs and doorstep delivery.",
  },
  {
    value: "1,200+",
    label: "Catalog SKUs",
    description: "Curated consumer technology, commercial hardware, packaging supplies, and essentials.",
  },
  {
    value: "99.7%",
    label: "On-Time Dispatch",
    description: "Guaranteed SLA delivery tracking across domestic US, UK, and international trade routes.",
  },
];

export function TrustBadgesSection() {
  return (
    <div className="w-full bg-[#0D442F] border-y border-[#1D6347]/60 text-white py-14 sm:py-20 relative overflow-hidden select-none">
      {/* Center ambient subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#34D399]/[0.08] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-10">
          {STATS_DATA.map((stat, idx) => (
            <div key={idx} className="flex flex-col space-y-2.5">
              {/* Stat Big Number */}
              <h3 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-[#4ADE80] tracking-tight leading-none">
                {stat.value}
              </h3>

              {/* Stat Title / Label */}
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {stat.label}
              </h4>

              {/* Description Text */}
              <p className="text-xs sm:text-sm leading-relaxed text-emerald-100/75 font-normal">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrustBadgesSection;
