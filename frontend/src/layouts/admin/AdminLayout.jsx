import React, { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Store } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store.js";
import { ROUTES } from "../../constants/routes.js";
import { BRAND_COLORS } from "../../constants/colors.js";
import { ADMIN_NAV_CONFIG } from "../../constants/adminNav.js";
import { EnterpriseSidebar } from "../../components/common/EnterpriseSidebar.jsx";
import vanomLogo from "../../assets/logo.png";
import { AdminTopbar } from "./AdminTopbar.jsx";
import { PageLoader } from "../../components/common/PageLoader.jsx";


export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();

  const userPermissions = user?.permissions || [];
  const userRoles = user?.roles || (user?.role ? [user.role] : ["SUPER_ADMIN"]);

  const customFooter = (
    <div className="p-3 bg-[#002D20] text-emerald-200">
      {!collapsed ? (
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Vanom Admin</p>
            <p className="text-[10px] text-emerald-300/60">v1.0.0 Enterprise</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-1">
          <Store className="w-4 h-4 text-emerald-300" />
        </div>
      )}
    </div>
  );

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
          navGroups={ADMIN_NAV_CONFIG}
          brand={{
            title: "Vanom",
            subtitle: "Admin Portal",
            logoSrc: vanomLogo,
            logoPath: ROUTES.ADMIN.DASHBOARD,
          }}
          footer={customFooter}
          userPermissions={userPermissions}
          userRoles={userRoles}
          bgColor={BRAND_COLORS.DEEP_GREEN}
          activeBgColor={BRAND_COLORS.VANOM_GREEN}
          isMobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </div>

      {/* ── RIGHT MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <AdminTopbar
          collapsed={collapsed}
          onToggleSidebar={() => {
            // On mobile, toggle mobile drawer. On desktop, toggle collapse.
            if (window.innerWidth < 768) {
              setMobileOpen((prev) => !prev);
            } else {
              setCollapsed((prev) => !prev);
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F4F6F8] p-3 sm:p-5 lg:p-7 min-w-0">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
