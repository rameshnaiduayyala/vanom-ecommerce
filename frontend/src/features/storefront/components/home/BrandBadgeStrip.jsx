import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BRANDS = [
  { name: "Samsung", color: "#1428A0", tag: "SAMSUNG" },
  { name: "boAt", color: "#E50914", tag: "boAt" },
  { name: "Philips", color: "#0B5ED7", tag: "PHILIPS" },
  { name: "Prestige", color: "#D32F2F", tag: "Prestige", bg: "bg-red-600 text-white" },
  { name: "pigeon", color: "#E11D48", tag: "pigeon" },
  { name: "Tefal", color: "#DC2626", tag: "Tefal", italic: true },
  { name: "croma", color: "#0D9488", tag: "croma" },
  { name: "Mi", color: "#FF6700", tag: "וח", iconBox: true },
  { name: "hp", color: "#0096D6", tag: "hp", circle: true },
  { name: "Lenovo", color: "#E2231A", tag: "Lenovo" },
];

export function BrandBadgeStrip({ brands = BRANDS }) {
  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Top Brands</h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-bold text-[#006B3C] hover:text-[#003D2B] transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Brand tiles grid matching reference */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {BRANDS.map((b) => (
            <Link
              key={b.name}
              to={`/products?search=${encodeURIComponent(b.name)}`}
              className="h-16 rounded-xl border border-gray-200 hover:border-[#006B3C]/40 hover:shadow-md bg-white flex items-center justify-center p-2 transition-all duration-200 group"
            >
              {b.iconBox ? (
                <div className="w-8 h-8 rounded-lg bg-[#FF6700] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {b.tag}
                </div>
              ) : b.circle ? (
                <div className="w-8 h-8 rounded-full border-2 border-[#0096D6] text-[#0096D6] flex items-center justify-center font-black text-xs italic">
                  {b.tag}
                </div>
              ) : b.bg ? (
                <div className="px-2.5 py-1 rounded bg-red-600 text-white font-black text-xs tracking-tight">
                  {b.tag}
                </div>
              ) : (
                <span
                  className={`font-black text-sm tracking-tight ${b.italic ? "italic" : ""}`}
                  style={{ color: b.color }}
                >
                  {b.tag}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandBadgeStrip;

