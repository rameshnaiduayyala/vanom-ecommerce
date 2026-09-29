import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Building2, PackageCheck, FileSpreadsheet, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store.js";
import { ROUTES } from "@/constants/routes.js";

export function B2BProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, activeCompany, logout } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsOpen(false);
    logout();
    navigate(ROUTES.LOGIN);
  };

  const userInitials =
    `${(user?.firstName?.[0] || "B").toUpperCase()}${(user?.lastName?.[0] || "U").toUpperCase()}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
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
            {userInitials}
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

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3.5 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>

          <Link
            to={ROUTES.B2B.COMPANY_PROFILE}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Company Profile</span>
          </Link>

          <Link
            to={ROUTES.B2B.ORDERS}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Purchase Orders</span>
          </Link>

          <Link
            to={ROUTES.B2B.QUOTES}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            <span>Quotes & RFQ</span>
          </Link>

          <div className="border-t border-slate-100 my-1" />

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-semibold"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default B2BProfileDropdown;
