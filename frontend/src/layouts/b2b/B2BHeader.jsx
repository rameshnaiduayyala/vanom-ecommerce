import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Store, Menu as MenuIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";
import { B2BCreditBadge } from "./B2BCreditBadge.jsx";
import { B2BCurrencyPicker } from "./B2BCurrencyPicker.jsx";
import { B2BNotificationsDropdown } from "./B2BNotificationsDropdown.jsx";
import { B2BProfileDropdown } from "./B2BProfileDropdown.jsx";

export function B2BHeader({ onToggleSidebar, searchQuery, onSearchChange }) {
  const [localSearch, setLocalSearch] = useState("");

  const searchValue = searchQuery !== undefined ? searchQuery : localSearch;
  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setLocalSearch(val);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* ── Left: Sidebar Toggle + Global Search ── */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <MenuIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Right Header Actions ── */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Credit Line Chip */}
        {/* <B2BCreditBadge /> */}

        {/* Regional Currency Picker */}
        <B2BCurrencyPicker />

        {/* View Retail Storefront */}
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
        <B2BNotificationsDropdown />

        {/* User Profile Dropdown */}
        <B2BProfileDropdown />
      </div>
    </header>
  );
}

export default B2BHeader;
