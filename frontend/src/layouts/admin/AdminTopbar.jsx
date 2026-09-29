import React from "react";
import { Link } from "react-router-dom";
import { Search, HelpCircle, Bell, Eye, Menu as MenuIcon } from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { AdminProfileDropdown } from "./AdminProfileDropdown.jsx";

export function AdminTopbar({
  collapsed,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Left: Sidebar Toggle + Global Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          title="Toggle Sidebar"
          type="button"
        >
          <MenuIcon className="w-4 h-4" />
        </button>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
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
          type="button"
          className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Help & Support"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notifications with Badge */}
        <button
          type="button"
          className="relative w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            5
          </span>
        </button>

        {/* Admin User Profile Dropdown */}
        <AdminProfileDropdown />
      </div>
    </header>
  );
}

export default AdminTopbar;
