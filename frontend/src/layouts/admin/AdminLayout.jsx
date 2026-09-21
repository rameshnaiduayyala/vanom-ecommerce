import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Store } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store.js";
import { ROUTES } from "../../constants/routes.js";
import { BRAND_COLORS } from "../../constants/colors.js";
import { ADMIN_NAV_CONFIG } from "../../constants/adminNav.js";
import { EnterpriseSidebar } from "../../components/common/EnterpriseSidebar.jsx";
import vanomLogo from "../../assets/logo.png";
import { AdminTopbar } from "./AdminTopbar.jsx";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
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
      {/* ── REUSABLE ENTERPRISE SCALABLE SIDEBAR ── */}
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
      />

      {/* ── RIGHT MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminTopbar
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F4F6F8] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
