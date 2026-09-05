import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCountryStore } from "../../stores/country.store.js";
import { useCartStore } from "../../stores/cart.store.js";
import { useAuthStore } from "../../stores/auth.store.js";
import { ROUTES } from "../../constants/routes.js";
import { AnnouncementBar } from "../../features/storefront/components/AnnouncementBar.jsx";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Package,
  X,
  Laptop,
  UtensilsCrossed,
  Boxes,
  CookingPot,
  Hammer,
  ArrowRight,
  ShieldCheck,
  Heart,
} from "lucide-react";

const MEGA_CATEGORIES = [
  {
    id: "cat-1",
    label: "Electronics & Tech",
    tagline: "POS, barcode scanners & networking",
    icon: Laptop,
    href: `${ROUTES.PRODUCTS}?category=cat-1`,
    subs: ["Smartphones & Tablets", "POS & Barcode Systems", "Enterprise Networking", "CCTV & Security", "Cabling & Accessories"],
  },
  {
    id: "cat-2",
    label: "Groceries & FMCG",
    tagline: "Premium grains, staples & cooking oils",
    icon: UtensilsCrossed,
    href: `${ROUTES.PRODUCTS}?category=cat-2`,
    subs: ["Basmati Rice Sacks", "Pulses & Lentils", "Cooking Oils & Fats", "Spices & Condiments", "Beverages & Dairy"],
  },
  {
    id: "cat-3",
    label: "Industrial & Packaging",
    tagline: "Heavy-duty shipping boxes & wrapping",
    icon: Boxes,
    href: `${ROUTES.PRODUCTS}?category=cat-3`,
    subs: ["Corrugated Cartons", "Stretch Wrap Films", "Bubble Wrap Rolls", "Thermal Labels & Tape", "Strapping Materials"],
  },
  {
    id: "cat-4",
    label: "Commercial Kitchen",
    tagline: "Induction cooktops, ovens & smallwares",
    icon: CookingPot,
    href: `${ROUTES.PRODUCTS}?category=cat-4`,
    subs: ["Commercial Induction", "Food Prep Equipment", "Cold Storage Units", "Stainless Smallwares", "Catering Essentials"],
  },
  {
    id: "cat-5",
    label: "Safety & Security",
    tagline: "PoE camera systems & biometric locks",
    icon: ShieldCheck,
    href: `${ROUTES.PRODUCTS}?category=cat-5`,
    subs: ["PoE Surveillance Kits", "Biometric Access Control", "Alarm Systems", "Security Domes", "Emergency Equipment"],
  },
  {
    id: "cat-6",
    label: "Building & Hardware",
    tagline: "Heavy tools, electrical fittings & fixtures",
    icon: Hammer,
    href: `${ROUTES.PRODUCTS}?category=cat-6`,
    subs: ["Fasteners & Fixtures", "Power & Hand Tools", "Electrical Fittings", "Cable Trays", "Plumbing Supplies"],
  },
];

export function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { country } = useCountryStore();
  const { cart, openCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState(MEGA_CATEGORIES[0]);

  const megaRef = useRef(null);
  const userRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  const toggleSearch = () => {
    setShowSearch((v) => {
      const next = !v;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return next;
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setShowMegaMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setShowMegaMenu(false);
    setShowSearch(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Utility Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8EDE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-8">

          {/* Brand Logo */}
          <Link to={ROUTES.HOME} className="shrink-0 flex items-center">
            <img
              src="/logo.png"
              alt="Vanom"
              className="h-9 sm:h-10 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-[#3D5648]">
            <Link
              to={ROUTES.HOME}
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive(ROUTES.HOME)
                  ? "text-[#074428] font-semibold bg-[#F0F7F1]"
                  : "hover:text-[#074428] hover:bg-[#F6FAF7]"
              }`}
            >
              Home
            </Link>

            {/* Products Catalog MegaMenu */}
            <div ref={megaRef} className="relative">
              <button
                onMouseEnter={() => setShowMegaMenu(true)}
                onClick={() => setShowMegaMenu((v) => !v)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  showMegaMenu || location.pathname.startsWith("/products")
                    ? "text-[#074428] font-semibold bg-[#F0F7F1]"
                    : "hover:text-[#074428] hover:bg-[#F6FAF7]"
                }`}
              >
                <span>Products</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showMegaMenu ? "rotate-180 text-[#074428]" : "text-slate-400"
                  }`}
                />
              </button>

              {/* MegaMenu Panel */}
              {showMegaMenu && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[780px] bg-white rounded-2xl border border-[#E8EDE9] shadow-xl shadow-black/[0.08] z-50 overflow-hidden animate-in fade-in-50 zoom-in-98 duration-150"
                  onMouseLeave={() => setShowMegaMenu(false)}
                >
                  <div className="grid grid-cols-12">
                    {/* Left Column: Department List */}
                    <div className="col-span-5 bg-[#FAFCFA] p-3 border-r border-[#E8EDE9]">
                      <div className="px-3 py-2 text-[10px] font-semibold text-[#8B9E91] uppercase tracking-[0.12em]">
                        Departments
                      </div>
                      <div className="space-y-0.5">
                        {MEGA_CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          const isHovered = activeMegaCategory.id === cat.id;
                          return (
                            <div
                              key={cat.id}
                              onMouseEnter={() => setActiveMegaCategory(cat)}
                              className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                                isHovered
                                  ? "bg-white shadow-sm text-[#074428] border border-[#E8EDE9]"
                                  : "text-[#3D5648] hover:bg-white/60 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isHovered ? "bg-[#074428] text-white" : "bg-[#F0F7F1] text-[#3D5648]"
                                } transition-colors`}>
                                  <Icon className="w-4 h-4" />
                                </span>
                                <div className="min-w-0">
                                  <span className={`block text-[13px] truncate ${isHovered ? "font-semibold" : "font-medium"}`}>
                                    {cat.label}
                                  </span>
                                  <span className="block text-[11px] text-[#8B9E91] font-normal truncate">
                                    {cat.tagline}
                                  </span>
                                </div>
                              </div>
                              <ArrowRight
                                className={`w-3.5 h-3.5 shrink-0 transition-all ${
                                  isHovered ? "text-[#074428] translate-x-0.5 opacity-100" : "opacity-0"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Subcategories */}
                    <div className="col-span-7 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EDE9]">
                          <h4 className="text-sm font-semibold text-[#0F2B1C]">
                            {activeMegaCategory.label}
                          </h4>
                          <Link
                            to={activeMegaCategory.href}
                            onClick={() => setShowMegaMenu(false)}
                            className="text-[12px] font-medium text-[#059669] hover:text-[#074428] flex items-center gap-1 transition-colors"
                          >
                            <span>View All</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          {activeMegaCategory.subs.map((sub) => (
                            <Link
                              key={sub}
                              to={`${activeMegaCategory.href}&sub=${encodeURIComponent(sub)}`}
                              onClick={() => setShowMegaMenu(false)}
                              className="group px-3 py-2.5 rounded-lg hover:bg-[#F6FAF7] transition-colors flex items-center justify-between"
                            >
                              <span className="text-[13px] text-[#3D5648] group-hover:text-[#074428] group-hover:font-medium transition-colors">
                                {sub}
                              </span>
                              <ArrowRight className="w-3 h-3 text-transparent group-hover:text-[#074428] transition-all" />
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Promo */}
                      <div className="mt-5 p-4 rounded-xl bg-[#0F2B1C] text-white flex items-center justify-between gap-4">
                        <div>
                          <span className="block text-[10px] font-semibold text-[#84CC16] uppercase tracking-wider mb-0.5">
                            Fast Dispatch
                          </span>
                          <span className="block text-[13px] font-medium text-white/80">
                            Multi-market delivery across US & UK
                          </span>
                        </div>
                        <Link
                          to={ROUTES.PRODUCTS}
                          onClick={() => setShowMegaMenu(false)}
                          className="px-4 py-2 rounded-lg bg-[#84CC16] hover:bg-[#74B626] text-[#0F2B1C] text-[12px] font-bold shrink-0 transition-colors"
                        >
                          Browse All
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to={ROUTES.PRODUCTS}
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive(ROUTES.PRODUCTS)
                  ? "text-[#074428] font-semibold bg-[#F0F7F1]"
                  : "hover:text-[#074428] hover:bg-[#F6FAF7]"
              }`}
            >
              All Products
            </Link>

            <Link
              to={ROUTES.ORDERS}
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive(ROUTES.ORDERS)
                  ? "text-[#074428] font-semibold bg-[#F0F7F1]"
                  : "hover:text-[#074428] hover:bg-[#F6FAF7]"
              }`}
            >
              Track Orders
            </Link>

            <Link
              to={ROUTES.CONTACT}
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive(ROUTES.CONTACT)
                  ? "text-[#074428] font-semibold bg-[#F0F7F1]"
                  : "hover:text-[#074428] hover:bg-[#F6FAF7]"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={toggleSearch}
              aria-label="Search"
              className="w-10 h-10 flex items-center justify-center text-[#3D5648] hover:text-[#074428] hover:bg-[#F6FAF7] rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
              aria-label="Cart"
              className="w-10 h-10 flex items-center justify-center text-[#3D5648] hover:text-[#074428] hover:bg-[#F6FAF7] rounded-lg transition-colors relative cursor-pointer"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cart?.itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#074428] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </button>

            {/* User Account */}
            <div className="relative" ref={userRef}>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#F6FAF7] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#074428] text-white flex items-center justify-center text-xs font-semibold">
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-[#E8EDE9] shadow-xl shadow-black/[0.08] py-1 z-50 overflow-hidden">
                      <div className="px-3 py-3 border-b border-[#E8EDE9] bg-[#FAFCFA]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#074428] text-white flex items-center justify-center text-sm font-semibold">
                            {(user?.firstName?.[0] || "U").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#0F2B1C] truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[11px] text-[#8B9E91] truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={ROUTES.ORDERS}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#3D5648] hover:bg-[#F6FAF7] hover:text-[#074428] transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <Link
                        to={ROUTES.ACCOUNT_PROFILE}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#3D5648] hover:bg-[#F6FAF7] hover:text-[#074428] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile & Addresses
                      </Link>
                      <Link
                        to={ROUTES.WISHLIST}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#3D5648] hover:bg-[#F6FAF7] hover:text-[#074428] transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Link>
                      <div className="border-t border-[#E8EDE9] mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  className="w-10 h-10 flex items-center justify-center text-[#3D5648] hover:text-[#074428] hover:bg-[#F6FAF7] rounded-lg transition-colors"
                  title="Sign In"
                >
                  <User className="w-[18px] h-[18px]" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Slide-Down Search Bar */}
        {showSearch && (
          <div className="border-t border-[#E8EDE9] bg-[#FAFCFA] px-4 sm:px-6 lg:px-8 py-3 animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9E91]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, categories, brands..."
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#D4DED6] rounded-xl focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/8 text-[#0F2B1C] placeholder:text-[#A3B5A8]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#074428] hover:bg-[#0a5634] text-white text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="p-2.5 rounded-xl border border-[#D4DED6] bg-white text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default PublicHeader;
