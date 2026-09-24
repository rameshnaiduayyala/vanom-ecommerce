import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCountryStore } from "../../stores/country.store.js";
import { useCartStore } from "../../stores/cart.store.js";
import { useAuthStore } from "../../stores/auth.store.js";
import { ROUTES } from "../../constants/routes.js";
import { SUPPORTED_COUNTRIES } from "../../constants/countries.js";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  ChevronDown,
  X,
  Package,
  LogOut,
  Laptop,
  Home,
  UtensilsCrossed,
  Sparkles,
  HeartPulse,
  Gamepad2,
  Dumbbell,
  Briefcase,
  Dog,
  Car,
  Trees,
  ShieldCheck,
  Building2,
  LayoutDashboard,
  Boxes,
} from "lucide-react";

const NAV_CATEGORIES = [
  { id: "electronics-gadgets", label: "Electronics & Gadgets", icon: Laptop, path: `${ROUTES.PRODUCTS}?category=electronics-gadgets` },
  { id: "health-fitness-wearables", label: "Health, Fitness & Wearables", icon: HeartPulse, path: `${ROUTES.PRODUCTS}?category=health-fitness-wearables` },
  { id: "home-kitchen", label: "Home & Kitchen", icon: Home, path: `${ROUTES.PRODUCTS}?category=home-kitchen` },
  { id: "groceries-daily-needs", label: "Groceries & Daily Needs", icon: Package, path: `${ROUTES.PRODUCTS}?category=groceries-daily-needs` },
  { id: "beauty-personal-care", label: "Beauty & Personal Care", icon: Sparkles, path: `${ROUTES.PRODUCTS}?category=beauty-personal-care` },
  { id: "household-cleaning", label: "Household & Cleaning", icon: UtensilsCrossed, path: `${ROUTES.PRODUCTS}?category=household-cleaning` },
  { id: "all-categories", label: "All Categories", icon: Package, path: ROUTES.PRODUCTS },
];

const SEARCH_CATEGORIES = [
  "All Categories",
  "Electronics & Gadgets",
  "Health, Fitness & Wearables",
  "Home & Kitchen",
  "Groceries & Daily Needs",
  "Beauty & Personal Care",
  "Household & Cleaning",
  "Mobiles & Accessories",
  "Laptops & Computers",
  "TVs & Home Entertainment",
  "Cameras & Drones",
  "Health Monitoring",
  "Fitness Equipment",
  "Nutrition & Supplements",
  "Kitchen Appliances",
  "Cookware & Tableware",
  "Home Decor & Furnishing",
  "Staples & Pantry",
  "Spices & Masalas",
  "Snacks & Packaged Foods",
  "Beverages",
  "Skin & Hair Care",
  "Makeup & Cosmetics",
  "Grooming Appliances",
  "Floor & Surface Cleaners",
  "Dishwashing & Laundry",
  "Pest Control & Repellents",
];

export function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, setCountry } = useCountryStore();
  const { cart, openCart } = useCartStore();
  const { user, isAuthenticated, activeCompany, logout } = useAuthStore();

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isSuperAdmin =
    user?.role === "SUPERADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    roles.includes("SUPERADMIN") ||
    roles.includes("SUPER_ADMIN");

  const isAdmin =
    isSuperAdmin ||
    user?.role === "ADMIN" ||
    roles.includes("ADMIN");

  const isB2B =
    user?.customerType === "B2B" ||
    Boolean(activeCompany) ||
    Boolean(user?.company) ||
    Boolean(user?.companyId) ||
    Boolean(user?.business) ||
    Boolean(user?.bulkBusiness) ||
    user?.role === "COMPANY_ADMIN" ||
    user?.role === "COMPANY_BUYER" ||
    roles.includes("COMPANY_ADMIN") ||
    roles.includes("COMPANY_BUYER") ||
    roles.includes("B2B");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAllCategoriesMenu, setShowAllCategoriesMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef(null);

  const categoryDropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const allCategoriesRef = useRef(null);
  const userRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const catParam = selectedCategory !== "All Categories" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}${catParam}`);
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }
  };

  // Focus mobile input on open
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [mobileSearchOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
      if (allCategoriesRef.current && !allCategoriesRef.current.contains(e.target)) {
        setShowAllCategoriesMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setShowCategoryDropdown(false);
    setShowCountryDropdown(false);
    setShowAllCategoriesMenu(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F7F2DF] border-b border-[#ebdcb0] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {/* ─── ROW 1: Main Bar (Logo, Search with Category Selector, Wishlist, Account, Cart) ─── */}
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-[76px] flex items-center justify-between gap-1 sm:gap-8 relative">

          {/* Left: Mobile Menu Trigger (Desktop: sits inline with Logo) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-gray-700 hover:bg-black/5 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo on Desktop (inline) */}
            <Link to={ROUTES.HOME} className="hidden lg:flex items-center py-1">
              <img
                src="/logo.png"
                alt="Vanom"
                className="h-12 sm:h-14 w-auto object-contain hover:scale-103 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* Mobile Logo (Centered absolutely in the header bar on small screens) */}
          <div className="lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto max-w-[130px] sm:max-w-[160px]">
            <Link to={ROUTES.HOME} className="flex items-center py-1">
              <img
                src="/logo.png"
                alt="Vanom"
                className="h-8 sm:h-11 w-auto max-w-full object-contain"
              />
            </Link>
          </div>

          {/* Center Search with Integrated "All Categories" Dropdown */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl items-center border border-gray-300 rounded-lg overflow-visible bg-white focus-within:border-[#003D2B] focus-within:ring-1 focus-within:ring-[#003D2B] transition-all relative h-[42px]"
          >
            {/* Category Dropdown Pill */}
            <div className="relative h-full" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown((v) => !v)}
                className="h-full px-3.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 border-r border-gray-200 bg-gray-50/70 hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer rounded-l-lg"
              >
                <span className="max-w-[110px] truncate">{selectedCategory}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showCategoryDropdown && (
                <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-lg border border-gray-200 shadow-xl py-1.5 z-50 animate-in fade-in-50 duration-100 max-h-64 overflow-y-auto">
                  {SEARCH_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors flex items-center justify-between ${selectedCategory === cat
                        ? "bg-[#EAF7F0] text-[#003D2B] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <span className="text-[10px] text-[#006B3C]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="flex-1 px-3.5 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Green Magnifying Glass Button */}
            <button
              type="submit"
              aria-label="Search"
              className="h-full px-5 bg-[#003D2B] hover:bg-[#002d20] text-white flex items-center justify-center transition-colors cursor-pointer rounded-r-[7px]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Action Links (Mobile Search Trigger, Wishlist, Account, Cart) */}
          <div className="flex items-center gap-1 sm:gap-6 shrink-0 z-10">

            {/* Mobile Search Icon Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-1.5 rounded-lg text-gray-700 hover:text-[#358B5B] hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Toggle search"
            >
              {mobileSearchOpen ? (
                <X className="w-[19px] h-[19px] text-gray-700" />
              ) : (
                <Search className="w-[19px] h-[19px] text-gray-700" />
              )}
            </button>

            {/* Country / Currency Selector (Desktop) */}
            <div className="relative hidden sm:block" ref={countryDropdownRef}>
              <button
                type="button"
                onClick={() => setShowCountryDropdown((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#ebdcb0] bg-white/70 hover:bg-white hover:border-[#358B5B] text-gray-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer select-none"
                title="Change Country & Currency"
              >
                <img
                  src={country.flagUrl || `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                  alt={country.name}
                  className="w-4 h-4 rounded-full object-cover border border-gray-200 shrink-0"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.style.display = "inline";
                  }}
                />
                <span className="hidden" style={{ display: "none" }}>{country.flag}</span>
                <span className="font-bold text-[11px] text-gray-900">{country.code}</span>
                <span className="text-[10px] text-gray-500 font-normal">({country.symbol})</span>
                <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${showCountryDropdown ? "rotate-180" : ""}`} />
              </button>

              {showCountryDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden animate-in fade-in-50 duration-100">
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    Ship To / Currency
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {SUPPORTED_COUNTRIES.map((c) => {
                      const isSelected = c.code === country.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCountry(c);
                            setShowCountryDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-[#EAF7F0] transition-colors cursor-pointer ${isSelected ? "bg-[#EAF7F0] text-[#003D2B] font-bold" : "text-gray-700"
                            }`}
                        >
                          <img
                            src={c.flagUrl || `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                            alt={c.name}
                            className="w-5 h-5 rounded-full object-cover border border-gray-200 shrink-0"
                            onError={(e) => {
                              e.target.style.display = "none";
                              if (e.target.nextSibling) e.target.nextSibling.style.display = "inline";
                            }}
                          />
                          <span className="hidden" style={{ display: "none" }}>{c.flag}</span>
                          <span className="flex-1 text-left truncate">{c.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-[#006B3C] text-white font-bold" : "bg-gray-100 text-gray-500"
                              }`}
                          >
                            {c.symbol} {c.currency}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to={ROUTES.WISHLIST || "/wishlist"}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#003D2B] transition-colors group cursor-pointer"
            >
              <Heart className="w-[18px] h-[18px] text-gray-600 group-hover:text-[#003D2B] transition-colors" />
              <span>Wishlist</span>
            </Link>

            {/* Account / Sign In */}
            <div className="relative" ref={userRef}>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-1.5 sm:px-1.5 sm:py-1 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#003D2B] transition-colors cursor-pointer"
                  >
                    <User className="w-[19px] h-[19px] text-gray-600" />
                    <span className="hidden sm:inline truncate max-w-[90px]">
                      {user?.firstName || "Account"}
                    </span>
                    {isSuperAdmin ? (
                      <span className="hidden sm:inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                        Super Admin
                      </span>
                    ) : isAdmin ? (
                      <span className="hidden sm:inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                        Admin
                      </span>
                    ) : isB2B ? (
                      <span className="hidden sm:inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        B2B
                      </span>
                    ) : null}
                    <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:inline" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-gray-100 shadow-2xl py-1.5 z-50 overflow-hidden animate-in fade-in-50 duration-100">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-emerald-50/50">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          {/* Role Badge */}
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${isSuperAdmin || isAdmin
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isB2B
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}>
                            {isSuperAdmin
                              ? "Super Admin"
                              : isAdmin
                                ? "Admin"
                                : isB2B
                                  ? (activeCompany?.businessName || user?.company?.businessName || "B2B Company")
                                  : "Consumer"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email}</p>
                      </div>

                      {/* 1. ADMIN / SUPER ADMIN PORTAL (if Super Admin or Admin) */}
                      {isAdmin && (
                        <div className="py-1 border-b border-gray-100">
                          <div className="px-4 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {isSuperAdmin ? "Super Admin Portal" : "Admin Portal"}
                          </div>
                          <Link
                            to={ROUTES.ADMIN.DASHBOARD}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-rose-600" />
                            <span>{isSuperAdmin ? "Admin Dashboard" : "Admin Dashboard"}</span>
                          </Link>
                        </div>
                      )}

                      {/* 2. B2B WHOLESALE COMPANY PORTAL (if B2B Company) */}
                      {isB2B && (
                        <div className="py-1 border-b border-gray-100">
                          <div className="px-4 py-1 text-[9px] font-bold text-amber-700 uppercase tracking-widest">
                            Company Workspace
                          </div>
                          <Link
                            to={ROUTES.B2B.DASHBOARD}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
                          >
                            <Building2 className="w-3.5 h-3.5 text-[#00875A]" />
                            <span>Dashboard</span>
                          </Link>
                        </div>
                      )}

                      {/* 3. CONSUMER STOREFRONT AREA */}
                      <div className="py-1">
                        <div className="px-4 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          Personal Account
                        </div>
                        <Link
                          to={ROUTES.ACCOUNT}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>My Account Hub</span>
                        </Link>
                        <Link
                          to={ROUTES.ORDERS}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-[#003D2B] transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          <span>My Store Orders</span>
                        </Link>
                        <Link
                          to={ROUTES.WISHLIST || "/wishlist"}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-[#003D2B] transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-gray-400" />
                          <span>My Wishlist</span>
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  className="p-1.5 sm:px-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#003D2B] transition-colors group cursor-pointer"
                >
                  <User className="w-[19px] h-[19px] text-gray-600 group-hover:text-[#003D2B] transition-colors" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>

            {/* Cart with Counter Badge */}
            <button
              onClick={openCart}
              className="p-1.5 sm:px-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#003D2B] transition-colors relative cursor-pointer group"
            >
              <div className="relative">
                <ShoppingCart className="w-[19px] h-[19px] text-gray-600 group-hover:text-[#003D2B] transition-colors" />
                <span className="absolute -top-1.5 -right-2 bg-[#F9BC15] text-[#003D2B] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cart?.itemCount || 0}
                </span>
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar Dropdown */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-2 bg-[#FFF7DD] border-t border-[#ebdcb0]/60 animate-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearch} className="flex items-center border border-[#ebdcb0] rounded-xl overflow-hidden bg-white shadow-md focus-within:border-[#358B5B] focus-within:ring-1 focus-within:ring-[#358B5B] transition-all h-10">
              {/* Left Search Icon */}
              <div className="pl-3 pr-1.5 text-gray-400 flex items-center justify-center">
                <Search className="w-4 h-4 text-[#358B5B]" />
              </div>

              {/* Input Field */}
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, concerns & brands..."
                className="flex-1 px-1 py-2 text-xs text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
              />

              {/* Clear Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Right Submit Button */}
              <button
                type="submit"
                aria-label="Search"
                className="h-full px-4 bg-[#358B5B] hover:bg-[#204B38] text-white text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ─── Mobile Slide-in Drawer ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <img src="/logo.png" alt="Vanom" className="h-8 w-auto object-contain" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1">
                {/* Admin Dashboard Mobile Link */}
                {isAuthenticated && isAdmin && (
                  <Link
                    to={ROUTES.ADMIN.DASHBOARD}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 shadow-2xs mb-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-rose-600" />
                    <span>{isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}</span>
                  </Link>
                )}

                {/* B2B Dashboard Mobile Link */}
                {isAuthenticated && isB2B && (
                  <Link
                    to={ROUTES.B2B.DASHBOARD}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#00875A] bg-[#E6F4EA] border border-[#00875A]/20 shadow-2xs mb-2"
                  >
                    <Building2 className="w-4 h-4 text-[#00875A]" />
                    <span>B2B Wholesale Dashboard</span>
                  </Link>
                )}

                <Link
                  to={ROUTES.HOME}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-100"
                >
                  <Home className="w-4 h-4" /> Home
                </Link>
                <Link
                  to={ROUTES.PRODUCTS}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-100"
                >
                  <Package className="w-4 h-4" /> All Products
                </Link>
                <Link
                  to={ROUTES.WISHLIST}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-100"
                >
                  <Heart className="w-4 h-4" /> Wishlist
                </Link>
                <Link
                  to={ROUTES.REGISTER_BUSINESS}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#006B3C] bg-[#EAF7F0]"
                >
                  <Briefcase className="w-4 h-4 text-[#006B3C]" />
                  For Business / Wholesale
                </Link>
              </div>

              {/* Country Selector in Mobile Drawer */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  Ship To & Currency
                </label>
                <select
                  value={country.code}
                  onChange={(e) => {
                    const sel = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
                    if (sel) setCountry(sel);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#358B5B]"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.symbol} {c.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mb-2">
                  Shop by Concern
                </span>
                <div className="space-y-0.5">
                  {NAV_CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    return (
                      <Link
                        key={cat.id}
                        to={cat.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <IconComp className="w-3.5 h-3.5 text-gray-500" />
                        <span>{cat.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg bg-[#003D2B] text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <User className="w-3.5 h-3.5" /> Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PublicHeader;

