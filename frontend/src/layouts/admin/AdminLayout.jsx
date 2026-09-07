import React, { useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";
import { ROUTES } from "../../constants/routes.js";
import { BRAND_COLORS } from "../../constants/colors.js";
import { ADMIN_NAV_CONFIG } from "../../constants/adminNav.js";
import { EnterpriseSidebar } from "../../components/common/EnterpriseSidebar.jsx";
import vanomLogo from "../../assets/logo.png";
import {
  Search,
  HelpCircle,
  Bell,
  Eye,
  Menu as MenuIcon,
  ChevronDown,
  LogOut,
  Building2,
  Settings,
  Store,
} from "lucide-react";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
          {/* Left: Sidebar Toggle + Global Search */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <MenuIcon className="w-4 h-4" />
            </button>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, orders, customers..."
                className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs hidden sm:inline">
                Ctrl + K
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* View Store Button */}
            <Link
              to={ROUTES.HOME}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">View Store</span>
            </Link>

            {/* Help */}
            <button
              className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Notifications with Badge */}
            <button
              className="relative w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                5
              </span>
            </button>

            {/* Admin User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName || "Admin"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#006B3C]/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#003D2B] text-emerald-200 font-bold text-xs flex items-center justify-center shadow-xs">
                    {(user?.firstName?.[0] || "R").toUpperCase()}
                    {(user?.lastName?.[0] || "A").toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.firstName || "Ramesh"} {user?.lastName || "Ayyala"}
                  </p>
                  <p className="text-[10px] font-medium text-emerald-700 leading-tight">
                    {user?.roles?.[0] || "Super Admin"}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to={ROUTES.B2B.ROOT}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>Wholesale B2B Portal</span>
                  </Link>
                  <Link
                    to={ROUTES.ADMIN.AUDIT_LOGS}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings & Security</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate(ROUTES.LOGIN);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F4F6F8] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
