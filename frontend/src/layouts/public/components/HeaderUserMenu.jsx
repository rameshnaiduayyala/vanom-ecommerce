import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  LogOut,
  ChevronDown,
  Building2,
  ShieldCheck,
  Package,
  Heart,
} from "lucide-react";
import { useAuthStore } from "../../../stores/auth.store.js";
import { ROUTES } from "../../../constants/routes.js";

export function HeaderUserMenu({ isOpen, onToggle, onClose }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isAuthenticated) {
    return (
      <Link
        to={ROUTES.LOGIN}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
      >
        <User className="w-4 h-4" />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border bg-surface-muted hover:bg-slate-100 text-text-primary text-xs font-bold transition-colors cursor-pointer"
      >
        <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-black">
          {user?.firstName?.[0] || "U"}
        </div>
        <span className="hidden md:inline max-w-[100px] truncate">{user?.firstName || "Account"}</span>
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-border mb-1">
            <div className="font-bold text-xs text-text-primary truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[10px] text-text-muted truncate">{user?.email}</div>
          </div>

          <div className="space-y-0.5">
            <Link
              to={ROUTES.ORDERS}
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-text-muted" />
              <span>My Orders</span>
            </Link>

            <Link
              to={ROUTES.WISHLIST || "/wishlist"}
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-text-muted" />
              <span>Saved Items</span>
            </Link>

            {user?.role === "B2B_BUYER" && (
              <Link
                to={ROUTES.B2B_DASHBOARD}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-brand-600 bg-brand-50 font-semibold hover:bg-brand-100 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>B2B Wholesale Portal</span>
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link
                to={ROUTES.ADMIN_DASHBOARD}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-purple-600 bg-purple-50 font-semibold hover:bg-purple-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer border-t border-border mt-1 pt-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeaderUserMenu;
