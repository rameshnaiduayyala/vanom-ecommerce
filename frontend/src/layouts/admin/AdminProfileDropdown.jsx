import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Building2, Settings } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store.js";
import { ROUTES } from "../../constants/routes.js";

export function AdminProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3.5 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <Link
            to={ROUTES.B2B.ROOT}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Wholesale B2B Portal</span>
          </Link>
          <Link
            to={ROUTES.ADMIN.AUDIT_LOGS}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Security</span>
          </Link>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminProfileDropdown;
