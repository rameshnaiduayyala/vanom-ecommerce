import React, { useState, useRef, useEffect } from "react";
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
  Laptop,
  UtensilsCrossed,
  Boxes,
  CookingPot,
  Shirt,
  Hammer,
  LayoutGrid,
  Bell,
  Package,
  X,
  Mic,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";


const MEGA_CATEGORIES = [
  {
    id: "cat-1",
    label: "Electronics & Tech",
    icon: Laptop,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: `${ROUTES.PRODUCTS}?category=cat-1`,
    subs: ["Smartphones & Tablets", "POS & Barcode Systems", "Enterprise Networking", "CCTV & Security", "Cabling & Accessories"],
  },
  {
    id: "cat-2",
    label: "Groceries & FMCG",
    icon: UtensilsCrossed,
    color: "text-amber-600",
    bg: "bg-amber-50",
    href: `${ROUTES.PRODUCTS}?category=cat-2`,
    subs: ["Basmati Rice (Bulk Sacks)", "Pulses & Lentils", "Cooking Oils (Drum)", "Spices & Condiments", "Frozen & Dairy Bulk"],
  },
  {
    id: "cat-3",
    label: "Industrial & Packaging",
    icon: Boxes,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: `${ROUTES.PRODUCTS}?category=cat-3`,
    subs: ["Corrugated Cartons", "Stretch Wrap Films", "Bubble Wrap Rolls", "Pallet Wrap", "Thermal Labels & Tape"],
  },
  {
    id: "cat-4",
    label: "Commercial Kitchen",
    icon: CookingPot,
    color: "text-rose-600",
    bg: "bg-rose-50",
    href: `${ROUTES.PRODUCTS}?category=cat-4`,
    subs: ["Commercial Ovens", "Food Prep Equipment", "Cold Storage Units", "Dishwashers (Industrial)", "Restaurant Smallwares"],
  },
  {
    id: "cat-5",
    label: "Fashion & Apparel",
    icon: Shirt,
    color: "text-purple-600",
    bg: "bg-purple-50",
    href: `${ROUTES.PRODUCTS}?category=cat-5`,
    subs: ["Bulk Uniforms & Workwear", "Corporate Polos & T-Shirts", "Safety Footwear", "Hi-Vis Vests & PPE", "Caps & Headwear"],
  },
  {
    id: "cat-6",
    label: "Building & Hardware",
    icon: Hammer,
    color: "text-slate-700",
    bg: "bg-slate-100",
    href: `${ROUTES.PRODUCTS}?category=cat-6`,
    subs: ["Structural Steel", "Cement & Aggregates", "Power Tools", "Plumbing Fixtures", "Electrical Fittings"],
  },
];

export function PublicHeader() {
  const navigate = useNavigate();
  const { country, setCountry } = useCountryStore();
  const { cart, openCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const megaRef = useRef(null);
  const countryRef = useRef(null);
  const userRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setShowMegaMenu(false);
      if (countryRef.current && !countryRef.current.contains(e.target)) setShowCountryMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0 py-1">
            <img
              src="/logo.png"
              alt="Vanom"
              className="h-10 sm:h-11 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Category Megamenu Trigger */}
          <div ref={megaRef} className="relative hidden lg:block">
            <button
              onMouseEnter={() => setShowMegaMenu(true)}
              onClick={() => setShowMegaMenu((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${showMegaMenu
                  ? "bg-brand-600 text-white border-brand-600"
                  : "text-text-primary border-border hover:bg-surface-muted"
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMegaMenu ? "rotate-180" : ""}`} />
            </button>

            {/* MEGA MENU PANEL */}
            {showMegaMenu && (
              <div
                className="absolute left-0 top-full mt-2 w-[680px] bg-white rounded-2xl border border-border shadow-2xl z-50 overflow-hidden"
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <div className="grid grid-cols-3 gap-0">
                  {MEGA_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.id} className="p-4 border-r border-b border-border last:border-r-0">
                        <Link
                          to={cat.href}
                          onClick={() => setShowMegaMenu(false)}
                          className="flex items-center gap-2 mb-2.5 group"
                        >
                          <span className={`w-7 h-7 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center shrink-0`}>
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <span className={`text-xs font-bold ${cat.color} group-hover:underline`}>{cat.label}</span>
                        </Link>
                        <ul className="space-y-1">
                          {cat.subs.map((sub) => (
                            <li key={sub}>
                              <Link
                                to={cat.href}
                                onClick={() => setShowMegaMenu(false)}
                                className="text-[11px] text-text-secondary hover:text-text-primary transition-colors"
                              >
                                {sub}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Footer banner */}
                <div className="bg-gradient-to-r from-brand-900 to-slate-900 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white">
                    <Building2 className="w-4 h-4 text-gold-400" />
                    <span className="font-semibold">B2B Wholesale — Apply for NET 30 credit terms</span>
                  </div>
                  <Link
                    to={ROUTES.B2B.ROOT}
                    onClick={() => setShowMegaMenu(false)}
                    className="text-[11px] font-bold text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    Wholesale Portal →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Global Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className={`relative flex items-center rounded-xl border-2 transition-all ${searchFocused ? "border-brand-500 shadow-sm shadow-brand-100" : "border-border"}`}>
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search products, SKUs, categories, brands..."
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-transparent focus:outline-none text-text-primary placeholder:text-text-muted"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-10 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface-muted text-text-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Country / Currency Selector */}
            <div className="relative" ref={countryRef}>
              <button
                onClick={() => setShowCountryMenu(!showCountryMenu)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-surface-muted text-text-secondary transition-colors"
              >
                <span className="text-base leading-none">{country.flag}</span>
                <span className="font-bold text-text-primary hidden sm:inline">{country.code}</span>
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </button>

              {showCountryMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-border shadow-xl py-1 z-50">
                  <div className="px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border">
                    Select Regional Market
                  </div>
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCountry(c);
                        setShowCountryMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-surface-muted transition-colors ${c.code === country.code ? "bg-brand-50 text-brand-700" : ""
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <span className="font-semibold">{c.name}</span>
                      </span>
                      <span className="font-bold text-text-muted font-mono text-[11px]">
                        {c.currency} {c.symbol}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to={ROUTES.WISHLIST}
              className="p-2 rounded-lg text-text-secondary hover:text-rose-500 hover:bg-rose-50 transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* User Account Menu */}
            <div className="relative" ref={userRef}>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-surface-muted text-text-primary transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-black">
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </div>
                    <span className="hidden sm:inline font-semibold">{user?.firstName || "Account"}</span>
                    <ChevronDown className="w-3 h-3 text-text-muted" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-border shadow-xl py-1 z-50">
                      <div className="px-3 py-3 border-b border-border bg-surface-muted/50">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-black">
                            {(user?.firstName?.[0] || "U").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-primary">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={ROUTES.ORDERS}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        My Orders
                      </Link>
                      <Link
                        to={ROUTES.ACCOUNT_PROFILE}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        Profile & Addresses
                      </Link>
                      <Link
                        to={ROUTES.WISHLIST}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        Saved Wishlist
                      </Link>
                      <div className="border-t border-border mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  className="flex items-center gap-1.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-sm hover:shadow-md relative"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Cart</span>
              {cart?.itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}