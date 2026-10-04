import React, { useState, Suspense } from "react";
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
import { PageLoader } from "@/components/common/PageLoader.jsx";


export function B2BLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      {/* ── MOBILE BACKDROP OVERLAY ── */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
              setMobileOpen(false);
            }
          }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* ── RESPONSIVE ENTERPRISE SIDEBAR CONTAINER ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-200 ease-in-out shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
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
          isMobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </div>

      {/* ── RIGHT MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <B2BHeader
          collapsed={collapsed}
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setMobileOpen((prev) => !prev);
            } else {
              setCollapsed((prev) => !prev);
            }
          }}
        />
        <main className="flex-1 overflow-y-auto bg-[#F4F6F8] p-3 sm:p-5 lg:p-7 min-w-0">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default B2BLayout;
