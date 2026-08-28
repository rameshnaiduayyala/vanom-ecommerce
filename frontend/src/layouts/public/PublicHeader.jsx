import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCountryStore } from "../../stores/country.store.js";
import { useCartStore } from "../../stores/cart.store.js";
import { useAuthStore } from "../../stores/auth.store.js";
import { SUPPORTED_COUNTRIES } from "../../constants/countries.js";
import { ROUTES } from "../../constants/routes.js";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Globe,
  Building2,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";

export function PublicHeader() {
  const navigate = useNavigate();
  const { country, setCountry } = useCountryStore();
  const { cart, openCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs">
      {/* Main Public Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0 py-1">
          <img
            src="/logo.png"
            alt="Vanom"
            className="h-10 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity"
          />
        </Link>

        {/* Global Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, electronics, groceries, apparel, industrial..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-surface-muted/50 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
        </form>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Country / Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCountryMenu(!showCountryMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-surface-muted text-text-secondary transition-colors"
            >
              <span>{country.flag}</span>
              <span className="font-semibold text-text-primary">{country.code}</span>
              <span className="text-text-muted">({country.symbol})</span>
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>

            {showCountryMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-border shadow-lg py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase border-b border-border">
                  Select Regional Market
                </div>
                {SUPPORTED_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c);
                      setShowCountryMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-muted transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-semibold text-text-muted">
                      {c.currency} ({c.symbol})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link
            to={ROUTES.WISHLIST}
            className="p-2 rounded-lg text-text-secondary hover:text-brand-600 hover:bg-surface-muted transition-colors relative"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* User Account Menu */}
          <div className="relative">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-surface-muted text-text-primary transition-colors"
                >
                  <User className="w-4 h-4 text-brand-600" />
                  <span className="hidden sm:inline font-semibold">{user?.firstName || "Account"}</span>
                  <ChevronDown className="w-3 h-3 text-text-muted" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-border shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-semibold text-text-primary">{user?.firstName} {user?.lastName}</p>
                      <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                    </div>
                    <Link
                      to={ROUTES.ORDERS}
                      onClick={() => setShowUserMenu(false)}
                      className="block px-3 py-2 text-xs text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    >
                      My Orders
                    </Link>
                    <Link
                      to={ROUTES.ACCOUNT_PROFILE}
                      onClick={() => setShowUserMenu(false)}
                      className="block px-3 py-2 text-xs text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    >
                      Profile & Addresses
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-border"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="flex items-center gap-1 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-2 rounded-lg transition-colors shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-muted hover:bg-brand-50 border border-border text-text-primary hover:border-brand-300 transition-colors relative"
          >
            <ShoppingCart className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold hidden sm:inline">Cart</span>
            {cart?.itemCount > 0 && (
              <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                {cart.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export function PublicNavigation() {
  const categories = [
    { label: "All Categories", href: ROUTES.PRODUCTS },
    { label: "Electronics & Tech", href: `${ROUTES.PRODUCTS}?category=cat-1` },
    { label: "Groceries & FMCG Bulk", href: `${ROUTES.PRODUCTS}?category=cat-2` },
    { label: "Industrial & Packaging", href: `${ROUTES.PRODUCTS}?category=cat-3` },
    { label: "Home & Commercial Kitchen", href: `${ROUTES.PRODUCTS}?category=cat-4` },
    { label: "Fashion & Bulk Apparel", href: `${ROUTES.PRODUCTS}?category=cat-5` },
    { label: "Building & Hardware", href: `${ROUTES.PRODUCTS}?category=cat-6` },
  ];

  return (
    <nav className="bg-surface-muted/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto py-2.5 text-xs font-medium text-text-secondary whitespace-nowrap scrollbar-none">
          {categories.map((cat, index) => (
            <Link
              key={index}
              to={cat.href}
              className="hover:text-brand-600 transition-colors pb-0.5"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
