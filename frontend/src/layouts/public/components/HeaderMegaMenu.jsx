import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  ChevronDown,
  Laptop,
  UtensilsCrossed,
  Boxes,
  CookingPot,
  ShieldCheck,
  Hammer,
} from "lucide-react";
import { ROUTES } from "../../../constants/routes.js";

export const MEGA_CATEGORIES = [
  {
    id: "cat-1",
    label: "Electronics & Tech",
    icon: Laptop,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: `${ROUTES.PRODUCTS}?category=cat-1`,
    subs: ["Smartphones & Tablets", "POS & Barcode Systems", "Enterprise Networking", "CCTV & Security", "Cabling & Accessories"],
  },
  {
    id: "cat-2",
    label: "Groceries & FMCG",
    icon: UtensilsCrossed,
    color: "text-amber-600",
    bg: "bg-amber-50",
    href: `${ROUTES.PRODUCTS}?category=cat-2`,
    subs: ["Basmati Rice (Bulk Sacks)", "Pulses & Lentils", "Cooking Oils (Drum)", "Spices & Condiments", "Frozen & Dairy Bulk"],
  },
  {
    id: "cat-3",
    label: "Industrial & Packaging",
    icon: Boxes,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: `${ROUTES.PRODUCTS}?category=cat-3`,
    subs: ["Corrugated Cartons", "Stretch Wrap Films", "Bubble Wrap Rolls", "Pallet Wrap", "Thermal Labels & Tape"],
  },
  {
    id: "cat-4",
    label: "Commercial Kitchen",
    icon: CookingPot,
    color: "text-rose-600",
    bg: "bg-rose-50",
    href: `${ROUTES.PRODUCTS}?category=cat-4`,
    subs: ["Commercial Ovens", "Food Prep Equipment", "Cold Storage Units", "Dishwashers (Industrial)", "Restaurant Smallwares"],
  },
  {
    id: "cat-5",
    label: "Safety & Security",
    icon: ShieldCheck,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    href: `${ROUTES.PRODUCTS}?category=cat-5`,
    subs: ["PoE Surveillance Systems", "Biometric Access Control", "Fire Suppression Hardware", "Alarm Systems", "Security Domes"],
  },
  {
    id: "cat-6",
    label: "Building & Hardware",
    icon: Hammer,
    color: "text-slate-700",
    bg: "bg-slate-100",
    href: `${ROUTES.PRODUCTS}?category=cat-6`,
    subs: ["Structural Steel", "Cement & Aggregates", "Power Tools", "Plumbing Fixtures", "Electrical Fittings"],
  },
];

export function HeaderMegaMenu({ isOpen, onToggle, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          isOpen
            ? "bg-white/20 text-white"
            : "bg-white/10 hover:bg-white/20 text-white"
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">All Departments</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-[720px] max-w-[90vw] bg-white rounded-2xl border border-border shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-muted">
              Marketplace Departments
            </h4>
            <Link
              to={ROUTES.PRODUCTS}
              onClick={onClose}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Browse All Products →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {MEGA_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} className="space-y-2">
                  <Link
                    to={cat.href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 font-bold text-sm text-text-primary hover:text-brand-600 transition-colors group"
                  >
                    <div className={`w-7 h-7 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{cat.label}</span>
                  </Link>

                  <ul className="pl-9 space-y-1">
                    {cat.subs.map((sub) => (
                      <li key={sub}>
                        <Link
                          to={`${ROUTES.PRODUCTS}?search=${encodeURIComponent(sub)}`}
                          onClick={onClose}
                          className="text-xs text-text-muted hover:text-brand-600 transition-colors block py-0.5"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default HeaderMegaMenu;
