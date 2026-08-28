import React from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import {
  LayoutDashboard,
  Layers,
  Boxes,
  FileSpreadsheet,
  PackageCheck,
  Building2,
  FileText,
  Users,
} from "lucide-react";
import { cn } from "../../utils/cn.js";

export function B2BSidebar() {
  const links = [
    { label: "Dashboard", to: ROUTES.B2B.DASHBOARD, icon: LayoutDashboard },
    { label: "Wholesale Catalog", to: ROUTES.B2B.CATALOG, icon: Layers },
    { label: "Bulk & Pallet Order", to: ROUTES.B2B.BULK_ORDER, icon: Boxes },
    { label: "Quotes & Requests", to: ROUTES.B2B.QUOTES, icon: FileSpreadsheet },
    { label: "Wholesale Orders", to: ROUTES.B2B.ORDERS, icon: PackageCheck },
    { divider: true, label: "Organization" },
    { label: "Company Profile", to: ROUTES.B2B.COMPANY_PROFILE, icon: Building2 },
    { label: "Business Documents", to: ROUTES.B2B.COMPANY_DOCUMENTS, icon: FileText },
    { label: "Team Members", to: ROUTES.B2B.COMPANY_MEMBERS, icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 flex-1 space-y-1">
        {links.map((link, index) => {
          if (link.divider) {
            return (
              <div key={index} className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {link.label}
              </div>
            );
          }

          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-gold-500/10 text-gold-400 font-semibold border border-gold-500/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">Dedicated Account Support</p>
        <p className="mt-0.5">wholesale@vanom.com</p>
      </div>
    </aside>
  );
}
