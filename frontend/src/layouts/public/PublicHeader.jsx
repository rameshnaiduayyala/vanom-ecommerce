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
  ChevronRight,
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
  Menu,
  Phone,
  Mail,
  Home,
  FileText,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);
  const [activeMegaCategory, setActiveMegaCategory] = useState(MEGA_CATEGORIES[0]);

  const megaRef = useRef(null);
  const userRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setMobileMenuOpen(false);
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
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Utility Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8EDE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4 sm:gap-8">

          {/* Left: Mobile Hamburger & Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[#3D5648] hover:text-[#00875A] hover:bg-[#F2FAF5] transition-colors cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo */}
            <Link to={ROUTES.HOME} className="shrink-0 flex items-center">
              <img
                src="/logo.png"
                alt="Vanom"
                className="h-8 sm:h-10 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-[#2D3F33]">
            <Link
              to={ROUTES.HOME}
              className={`px-3.5 py-2 rounded-lg transition-all ${isActive(ROUTES.HOME)
                  ? "text-[#00875A] font-semibold bg-[#E6F4EA]"
                  : "hover:text-[#00875A] hover:bg-[#F2FAF5]"
                }`}
            >
              Home
            </Link>

            {/* Products Catalog MegaMenu */}
            <div ref={megaRef} className="relative">
              <button
                onMouseEnter={() => setShowMegaMenu(true)}
                onClick={() => setShowMegaMenu((v) => !v)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${showMegaMenu || location.pathname.startsWith("/products")
                    ? "text-[#00875A] font-semibold bg-[#E6F4EA]"
                    : "hover:text-[#00875A] hover:bg-[#F2FAF5]"
                  }`}
              >
                <span>Products</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${showMegaMenu ? "rotate-180 text-[#00875A]" : "text-slate-400"
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
                              className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${isHovered
                                  ? "bg-[#E6F4EA] text-[#00875A]"
                                  : "text-[#3D5648] hover:bg-white"
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isHovered
                                      ? "bg-[#00875A] text-white"
                                      : "bg-[#F0F7F1] text-[#00875A]"
                                    }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-semibold leading-tight truncate">
                                    {cat.label}
                                  </div>
                                </div>
                              </div>
                              <ArrowRight
                                className={`w-3.5 h-3.5 transition-transform ${isHovered
                                    ? "text-[#00875A] translate-x-0.5"
                                    : "text-slate-300"
                                  }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Sub-categories & Direct Links */}
                    <div className="col-span-7 p-5 flex flex-col justify-between bg-white">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#E8EDE9] mb-4">
                          <div>
                            <h3 className="text-sm font-bold text-[#0F2B1C]">
                              {activeMegaCategory.label}
                            </h3>
                            <p className="text-[11px] text-[#5E7D67]">
                              {activeMegaCategory.tagline}
                            </p>
                          </div>
                          <Link
                            to={activeMegaCategory.href}
                            onClick={() => setShowMegaMenu(false)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#00875A] hover:text-[#00744D]"
                          >
                            <span>View All</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {activeMegaCategory.subs.map((sub, i) => (
                            <Link
                              key={i}
                              to={`${ROUTES.PRODUCTS}?search=${encodeURIComponent(sub)}`}
                              onClick={() => setShowMegaMenu(false)}
                              className="text-xs text-[#3D5648] hover:text-[#00875A] hover:bg-[#F2FAF5] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 group"
                            >
                              <span className="w-1 h-1 rounded-full bg-[#00875A] group-hover:scale-150 transition-transform" />
                              <span className="truncate">{sub}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Promo inside Mega Menu */}
                      <div className="mt-4 pt-3 border-t border-[#E8EDE9] flex items-center justify-between bg-[#FAFCFA] -mx-5 -mb-5 px-5 py-3">
                        <div className="text-[11px] text-[#5E7D67]">
                          <span className="font-semibold text-[#0F2B1C]">Direct Logistics</span> • Express Multi-Market Delivery
                        </div>
                        <Link
                          to={ROUTES.PRODUCTS}
                          onClick={() => setShowMegaMenu(false)}
                          className="text-[11px] font-semibold text-[#00875A] hover:underline flex items-center gap-1"
                        >
                          <span>Browse All</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to={ROUTES.PRODUCTS}
              className={`px-3.5 py-2 rounded-lg transition-all ${isActive(ROUTES.PRODUCTS)
                  ? "text-[#00875A] font-semibold bg-[#E6F4EA]"
                  : "hover:text-[#00875A] hover:bg-[#F2FAF5]"
                }`}
            >
              All Products
            </Link>

            <Link
              to={ROUTES.ORDERS}
              className={`px-3.5 py-2 rounded-lg transition-all ${isActive(ROUTES.ORDERS)
                  ? "text-[#00875A] font-semibold bg-[#E6F4EA]"
                  : "hover:text-[#00875A] hover:bg-[#F2FAF5]"
                }`}
            >
              Track Orders
            </Link>

            <Link
              to={ROUTES.CONTACT}
              className={`px-3.5 py-2 rounded-lg transition-all ${isActive(ROUTES.CONTACT)
                  ? "text-[#00875A] font-semibold bg-[#E6F4EA]"
                  : "hover:text-[#00875A] hover:bg-[#F2FAF5]"
                }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Search Button */}
            <button
              onClick={toggleSearch}
              aria-label="Search"
              className="w-9 h-9 flex items-center justify-center text-[#3D5648] hover:text-[#00875A] hover:bg-[#F6FAF7] rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              aria-label="Cart"
              className="w-9 h-9 flex items-center justify-center text-[#3D5648] hover:text-[#00875A] hover:bg-[#F6FAF7] rounded-lg transition-colors relative cursor-pointer"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cart?.itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#00875A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cart.itemCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div className="relative" ref={userRef}>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F6FAF7] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#00875A] text-white flex items-center justify-center text-xs font-semibold">
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-[#E8EDE9] shadow-xl shadow-black/[0.08] py-1 z-50 overflow-hidden">
                      <div className="px-3 py-3 border-b border-[#E8EDE9] bg-[#FAFCFA]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#00875A] text-white flex items-center justify-center text-sm font-semibold">
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
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#3D5648] hover:bg-[#F6FAF7] hover:text-[#00875A] transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <Link
                        to={ROUTES.ACCOUNT_PROFILE}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#3D5648] hover:bg-[#F6FAF7] hover:text-[#00875A] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile & Addresses
                      </Link>
                      <Link
                        to={ROUTES.WISHLIST}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#3D5648] hover:bg-[#F6FAF7] hover:text-[#00875A] transition-colors"
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
                  className="w-9 h-9 flex items-center justify-center text-[#3D5648] hover:text-[#00875A] hover:bg-[#F6FAF7] rounded-lg transition-colors"
                  title="Sign In"
                >
                  <User className="w-[18px] h-[18px]" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Slide-Down Search Bar (Responsive) */}
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
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-[#D4DED6] rounded-xl focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10 text-[#0F2B1C] placeholder:text-[#A3B5A8]"
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
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="p-2.5 rounded-xl border border-[#D4DED6] bg-white text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* ─── Mobile Slide-in Drawer Navigation ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in Content Panel */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-[340px] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E8EDE9] flex items-center justify-between bg-[#F8FAF9]">
              <Link to={ROUTES.HOME} onClick={() => setMobileMenuOpen(false)}>
                <img src="/logo.png" alt="Vanom" className="h-8 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-white border border-[#D4DED6] flex items-center justify-center text-slate-500 hover:text-slate-800"
                aria-label="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Primary Links */}
              <div className="space-y-1">
                <Link
                  to={ROUTES.HOME}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${isActive(ROUTES.HOME)
                      ? "bg-[#E6F4EA] text-[#00875A]"
                      : "text-[#3D5648] hover:bg-[#F8FAF9]"
                    }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>

                <Link
                  to={ROUTES.PRODUCTS}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${isActive(ROUTES.PRODUCTS)
                      ? "bg-[#E6F4EA] text-[#00875A]"
                      : "text-[#3D5648] hover:bg-[#F8FAF9]"
                    }`}
                >
                  <Package className="w-4 h-4" />
                  <span>All Products Catalog</span>
                </Link>

                <Link
                  to={ROUTES.ORDERS}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${isActive(ROUTES.ORDERS)
                      ? "bg-[#E6F4EA] text-[#00875A]"
                      : "text-[#3D5648] hover:bg-[#F8FAF9]"
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Track Orders</span>
                </Link>

                <Link
                  to={ROUTES.CONTACT}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${isActive(ROUTES.CONTACT)
                      ? "bg-[#E6F4EA] text-[#00875A]"
                      : "text-[#3D5648] hover:bg-[#F8FAF9]"
                    }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Contact & Support</span>
                </Link>
              </div>

              {/* Department Categories Accordion */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B9E91] px-2 block mb-2">
                  Shop Departments
                </span>
                <div className="space-y-1">
                  {MEGA_CATEGORIES.map((cat) => {
                    const isExpanded = mobileExpandedCat === cat.id;
                    const Icon = cat.icon;
                    return (
                      <div key={cat.id} className="rounded-xl border border-[#E8EDE9] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                          className="w-full p-2.5 text-left text-xs font-semibold text-[#0F2B1C] bg-[#FAFCFA] flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-[#00875A]" />
                            <span>{cat.label}</span>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""
                              }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="p-2 space-y-1 bg-white border-t border-[#E8EDE9]">
                            {cat.subs.map((sub, idx) => (
                              <Link
                                key={idx}
                                to={`${ROUTES.PRODUCTS}?search=${encodeURIComponent(sub)}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-2.5 py-1.5 text-xs text-[#3D5648] hover:text-[#00875A] rounded-md transition-colors"
                              >
                                • {sub}
                              </Link>
                            ))}
                            <Link
                              to={cat.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-2.5 py-1.5 text-xs font-bold text-[#00875A] border-t border-slate-100 mt-1 pt-1"
                            >
                              View All in {cat.label} →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Request Quote Promo */}
              <div className="p-4 rounded-2xl bg-[#064027] text-white space-y-2">
                <span className="text-[10px] font-bold text-[#4ADE80] uppercase tracking-wider block">
                  Commercial Orders
                </span>
                <p className="text-xs text-emerald-100/80 leading-tight">
                  Scheduled wholesale delivery & enterprise quotations.
                </p>
                <Link
                  to={ROUTES.B2B.QUOTES}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-[#00875A] hover:bg-[#00744D] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>Request Quote</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Drawer Footer (User & Market) */}
            <div className="p-4 border-t border-[#E8EDE9] bg-[#F8FAF9] space-y-3">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#00875A] text-white flex items-center justify-center text-xs font-bold">
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-[#0F2B1C] truncate max-w-[120px]">
                      {user?.firstName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#00875A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </Link>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#5E7D67] pt-2 border-t border-slate-200">
                <span className="flex items-center gap-1">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                </span>
                <span className="font-mono font-bold text-[#0F2B1C]">{country.currency} ({country.symbol})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PublicHeader;
