import React from "react";
import {
  Sparkles,
  Cpu,
  HardDrive,
  Monitor,
  Battery,
  Weight,
  Layers,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Star,
} from "lucide-react";

export function getHighlightIcon(label = "") {
  const l = label.toLowerCase();
  if (l.includes("processor") || l.includes("motor") || l.includes("driver") || l.includes("chip")) return Cpu;
  if (l.includes("ram") || l.includes("storage") || l.includes("memory") || l.includes("jar")) return HardDrive;
  if (l.includes("display") || l.includes("screen") || l.includes("monitor")) return Monitor;
  if (l.includes("battery") || l.includes("playtime") || l.includes("power") || l.includes("charge")) return Battery;
  if (l.includes("weight")) return Weight;
  if (l.includes("type") || l.includes("pot") || l.includes("material") || l.includes("body")) return Layers;
  if (l.includes("os") || l.includes("speed") || l.includes("calling") || l.includes("technology")) return Zap;
  if (l.includes("delivery") || l.includes("shipping")) return Truck;
  if (l.includes("return")) return RotateCcw;
  if (l.includes("warranty")) return ShieldCheck;
  if (l.includes("authentic") || l.includes("organic") || l.includes("genuine")) return CheckCircle2;
  if (l.includes("rating") || l.includes("star")) return Star;
  return Sparkles;
}

export function ProductHighlightsGrid({ highlights = [] }) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-bold text-gray-900">Key Highlights</h3>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {highlights.map((item, idx) => {
          const Icon = item.icon || getHighlightIcon(item.label);
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-3.5 border border-gray-100 text-center flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-[#006B3C]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center mb-2 shadow-sm">
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-[11px] font-bold text-gray-800">{item.label}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductHighlightsGrid;
