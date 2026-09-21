import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store.js";
import { EnterpriseSidebar } from "@/components/common/EnterpriseSidebar.jsx";
import { B2BStatusGate } from "@/features/b2b/pages/B2BStatusGate.jsx";
import { B2B_NAV_CONFIG } from "@/constants/b2bNav.js";
import { BRAND_COLORS } from "@/constants/colors.js";
import { ROUTES } from "@/constants/routes.js";
import vanomLogo from "@/assets/logo.png";
import { B2BHeader } from "./B2BHeader.jsx";
import { B2BSidebarFooter } from "./B2BSidebarFooter.jsx";

export function B2BLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, activeCompany } = useAuthStore();

  const status =
    activeCompany?.status ||
    user?.bulkBusiness?.status ||
    user?.business?.status;

  // If status is PENDING or REJECTED, do NOT show sidebar, header, or portal routes
  if (status && status !== "APPROVED") {
    return <B2BStatusGate status={status} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F8] font-sans text-slate-800">
      {/* ── REUSABLE ENTERPRISE SCALABLE SIDEBAR ── */}
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
        footer={<B2BSidebarFooter collapsed={collapsed} />}
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
