import React from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";
import { ROUTES } from "../../constants/routes.js";
import {
  ShieldCheck,
  Store,
  Building2,
  LogOut,
  Bell,
  Activity,
} from "lucide-react";

export function AdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-border sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Admin Brand */}
        <div className="flex items-center gap-3">
          <Link to={ROUTES.ADMIN.DASHBOARD} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-text-primary tracking-tight">VANOM ADMIN</span>
              <span className="ml-2 text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-semibold">
                Control Plane
              </span>
            </div>
          </Link>
        </div>

        {/* Admin Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.HOME}
              className="text-xs text-text-secondary hover:text-text-primary bg-surface-muted px-2.5 py-1.5 rounded-lg border border-border flex items-center gap-1 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>

            <Link
              to={ROUTES.B2B.ROOT}
              className="text-xs text-text-secondary hover:text-text-primary bg-surface-muted px-2.5 py-1.5 rounded-lg border border-border flex items-center gap-1 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B Portal</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate(ROUTES.LOGIN);
              }}
              className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AdminSidebar() {
  const groups = [
    {
      title: "Core",
      items: [
        { label: "Dashboard", to: ROUTES.ADMIN.DASHBOARD },
      ],
    },
    {
      title: "Commerce & Catalog",
      items: [
        { label: "Products", to: ROUTES.ADMIN.PRODUCTS },
        { label: "Pricing & Tiers", to: ROUTES.ADMIN.PRICING },
        { label: "Orders & Fulfillment", to: ROUTES.ADMIN.ORDERS },
        { label: "B2B Quotes", to: ROUTES.ADMIN.QUOTES },
      ],
    },
    {
      title: "Customers & Wholesale",
      items: [
        { label: "Retail Users", to: ROUTES.ADMIN.USERS },
        { label: "B2B Companies", to: ROUTES.ADMIN.COMPANIES },
        { label: "Business Applications", to: ROUTES.ADMIN.BUSINESS_APPLICATIONS },
      ],
    },
    {
      title: "Operations & Financials",
      items: [
        { label: "Inventory Tracking", to: ROUTES.ADMIN.INVENTORY },
        { label: "Payments & Webhooks", to: ROUTES.ADMIN.PAYMENTS },
        { label: "Reports & Financials", to: ROUTES.ADMIN.REPORTS },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-border min-h-[calc(100vh-4rem)] p-4 shrink-0 flex flex-col">
      <div className="space-y-6 flex-1">
        {groups.map((group, gIdx) => (
          <div key={gIdx}>
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted text-text-primary">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto min-w-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
