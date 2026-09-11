import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { B2BHeader } from "./B2BHeader.jsx";
import { EnterpriseSidebar } from "../../components/common/EnterpriseSidebar.jsx";
import { B2B_NAV_CONFIG } from "../../constants/b2bNav.js";
import { BRAND_COLORS } from "../../constants/colors.js";
import { ROUTES } from "../../constants/routes.js";
import vanomLogo from "../../assets/logo.png";
import { Building2 } from "lucide-react";

export function B2BLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const customFooter = (
    <div className="p-3 bg-[#002D20] text-emerald-200">
      {!collapsed ? (
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gold-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Wholesale B2B</p>
            <p className="text-[10px] text-emerald-300/60">Commercial Tier</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-1">
          <Building2 className="w-4 h-4 text-gold-400" />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F8] font-sans text-slate-800">
      {/* ── REUSABLE ENTERPRISE SCALABLE SIDEBAR (ADMIN-LIKE) ── */}
      <EnterpriseSidebar
        collapsed={collapsed}
        navGroups={B2B_NAV_CONFIG}
        brand={{
          title: "Vanom",
          subtitle: "Wholesale Portal",
          logoSrc: vanomLogo,
          logoPath: ROUTES.B2B.DASHBOARD,
          badgeText: "B2B",
        }}
        footer={customFooter}
        bgColor={BRAND_COLORS.DEEP_GREEN}
        activeBgColor={BRAND_COLORS.VANOM_GREEN}
      />

      {/* ── RIGHT MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <B2BHeader
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto bg-[#F4F6F8] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default B2BLayout;

