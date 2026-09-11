import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";
import { useCountryStore } from "../../stores/country.store.js";
import { formatPrice } from "../../utils/formatters.js";
import { ROUTES } from "../../constants/routes.js";
import {
  CreditCard,
  LogOut,
  Store,
  Bell,
  Menu as MenuIcon,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  PackageCheck,
  Search,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { SUPPORTED_COUNTRIES } from "../../constants/countries.js";

export function B2BHeader({ collapsed = false, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, activeCompany, logout } = useAuthStore();
  const { country, setCountry } = useCountryStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isApproved = activeCompany?.status === "APPROVED";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* ── Left: Sidebar Toggle + Global Search ── */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <MenuIcon className="w-4 h-4" />
          </button>
        )}

        {/* Global Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wholesale commodities, SKUs, RFQs..."
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs hidden sm:inline">
            Ctrl + K
          </span>
        </div>
      </div>

      {/* ── Right Header Actions ── */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Credit Line Chip */}
        {isApproved && (
          <div className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg text-xs shadow-xs">
            <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-amber-800 font-bold uppercase tracking-wider leading-none">Credit (NET 30)</span>
              <span className="font-extrabold text-amber-900 leading-tight">
                {formatPrice(activeCompany?.availableCredit || 385000, country.currency, country.symbol)}
              </span>
            </div>
          </div>
        )}

        {/* Regional Currency Picker */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-sm leading-none">{country.flag}</span>
          <select
            value={country.code}
            onChange={(e) => {
              const found = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
              if (found) setCountry(found);
            }}
            className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer text-xs"
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-white text-slate-800">
                {c.code} ({c.currency})
              </option>
            ))}
          </select>
        </div>

        {/* View Retail Store Button */}
        <Link
          to={ROUTES.HOME}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Open Retail Storefront in New Tab"
        >
          <Store className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Retail Store</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Wholesale Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
              3
            </span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Wholesale Alerts</span>
                <span className="text-[10px] text-emerald-700 font-bold">3 Unread</span>
              </div>
              <div className="p-2 space-y-1 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <p className="font-semibold text-slate-800">Volume Tier Active</p>
                  <p className="text-[11px] text-slate-500">Tier 3 discount unlocked on Basmati Rice.</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <p className="font-semibold text-slate-800">Quote #RFQ-402 Approved</p>
                  <p className="text-[11px] text-slate-500">Commercial pricing ready for checkout.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.firstName || "Buyer"}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#006B3C]/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#003D2B] text-emerald-200 font-bold text-xs flex items-center justify-center shadow-xs">
                {(user?.firstName?.[0] || "B").toUpperCase()}
                {(user?.lastName?.[0] || "U").toUpperCase()}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.firstName || "Wholesale"} {user?.lastName || "Buyer"}
              </p>
              <p className="text-[10px] font-medium text-emerald-700 leading-tight">
                {activeCompany?.legalName || "Corporate Buyer"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <Link
                to={ROUTES.B2B.COMPANY_PROFILE}
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Company Profile</span>
              </Link>

              <Link
                to={ROUTES.B2B.ORDERS}
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>Purchase Orders</span>
              </Link>

              <Link
                to={ROUTES.B2B.QUOTES}
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                <span>Quotes & RFQ</span>
              </Link>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                  navigate(ROUTES.LOGIN);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-semibold"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

