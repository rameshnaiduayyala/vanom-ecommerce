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
  Heart,
  User,
  Building2,
  ShieldCheck,
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
  Sparkles,
  Truck,
  HelpCircle,
} from "lucide-react";

const MEGA_CATEGORIES = [
  {
    id: "cat-1",
    label: "Electronics & Tech",
    tagline: "Point of sale, barcode scanners & networking",
    icon: Laptop,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: `${ROUTES.PRODUCTS}?category=cat-1`,
    subs: ["Smartphones & Tablets", "POS & Barcode Systems", "Enterprise Networking", "CCTV & Security", "Cabling & Accessories"],
  },
  {
    id: "cat-2",
    label: "Groceries & FMCG",
    tagline: "Premium grains, staples & cooking oils",
    icon: UtensilsCrossed,
    color: "text-amber-600",
    bg: "bg-amber-50",
    href: `${ROUTES.PRODUCTS}?category=cat-2`,
    subs: ["Basmati Rice Sacks", "Pulses & Lentils", "Cooking Oils & Fats", "Spices & Condiments", "Beverages & Dairy"],
  },
  {
    id: "cat-3",
    label: "Industrial & Packaging",
    tagline: "Heavy-duty shipping boxes & wrapping",
    icon: Boxes,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: `${ROUTES.PRODUCTS}?category=cat-3`,
    subs: ["Corrugated Cartons", "Stretch Wrap Films", "Bubble Wrap Rolls", "Thermal Labels & Tape", "Strapping Materials"],
  },
  {
    id: "cat-4",
    label: "Commercial Kitchen",
    tagline: "Induction cooktops, ovens & smallwares",
    icon: CookingPot,
    color: "text-rose-600",
    bg: "bg-rose-50",
    href: `${ROUTES.PRODUCTS}?category=cat-4`,
    subs: ["Commercial Induction", "Food Prep Equipment", "Cold Storage Units", "Stainless Smallwares", "Catering Essentials"],
  },
  {
    id: "cat-5",
    label: "Safety & Security",
    tagline: "PoE camera systems & biometric locks",
    icon: ShieldCheck,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    href: `${ROUTES.PRODUCTS}?category=cat-5`,
    subs: ["PoE Surveillance Kits", "Biometric Access Control", "Alarm Systems", "Security Domes", "Emergency Equipment"],
  },
  {
    id: "cat-6",
    label: "Building & Hardware",
    tagline: "Heavy tools, electrical fittings & fixtures",
    icon: Hammer,
    color: "text-slate-700",
    bg: "bg-slate-100",
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

  return (
    <>
      {/* Top Utility Bar */}
      <AnnouncementBar />

      {/* Single Main Header (Unified Clean Enterprise Row) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE8DF] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">

          {/* Brand Logo */}
          <Link to={ROUTES.HOME} className="shrink-0 flex items-center py-1">
            <img
              src="/logo.png"
              alt="Vanom"
              className="h-10 sm:h-11 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Center Navigation Links with Enterprise Mega-Menu */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[#3D5648]">
            <Link
              to={ROUTES.HOME}
              className={`transition-colors relative py-1 ${
                location.pathname === ROUTES.HOME
                  ? "text-[#074428] font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#074428] after:rounded-full"
                  : "hover:text-[#074428]"
              }`}
            >
              Home
            </Link>

            {/* Products Catalog MegaMenu Dropdown */}
            <div ref={megaRef} className="relative">
              <button
                onMouseEnter={() => setShowMegaMenu(true)}
                onClick={() => setShowMegaMenu((v) => !v)}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
                  showMegaMenu || location.pathname.startsWith("/products")
                    ? "text-[#074428] font-extrabold"
                    : "hover:text-[#074428]"
                }`}
              >
                <span>Products Catalog</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showMegaMenu ? "rotate-180 text-[#074428]" : "text-slate-400"
                  }`}
                />
              </button>

              {/* Enterprise MegaMenu Panel */}
              {showMegaMenu && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[840px] bg-white rounded-3xl border border-[#DCE8DF] shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-98 duration-150"
                  onMouseLeave={() => setShowMegaMenu(false)}
                >
                  <div className="grid grid-cols-12">
                    {/* Left Column: Department List */}
                    <div className="col-span-5 bg-[#F6FAF7] p-4 border-r border-[#E3ECE6] space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Departments
                      </div>
                      {MEGA_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isHovered = activeMegaCategory.id === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onMouseEnter={() => setActiveMegaCategory(cat)}
                            className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                              isHovered
                                ? "bg-white shadow-xs text-[#074428] font-bold border border-[#DCE8DF]"
                                : "text-slate-700 hover:text-[#074428] hover:bg-white/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-8 h-8 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center shrink-0`}
                              >
                                <Icon className="w-4 h-4" />
                              </span>
                              <div className="min-w-0">
                                <span className="block text-xs font-bold truncate">{cat.label}</span>
                                <span className="block text-[10px] text-slate-400 font-normal truncate">
                                  {cat.tagline}
                                </span>
                              </div>
                            </div>
                            <ArrowRight
                              className={`w-3.5 h-3.5 transition-transform ${
                                isHovered ? "text-[#074428] translate-x-0.5" : "text-slate-300 opacity-0"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column: Subcategories & Featured Collection */}
                    <div className="col-span-7 p-6 flex flex-col justify-between bg-white">
                      <div>
                        {/* Subcategory Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#E3ECE6] mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                            <h4 className="text-sm font-extrabold text-[#072115]">
                              {activeMegaCategory.label}
                            </h4>
                          </div>
                          <Link
                            to={activeMegaCategory.href}
                            onClick={() => setShowMegaMenu(false)}
                            className="text-xs font-bold text-[#059669] hover:text-[#074428] flex items-center gap-1 transition-colors"
                          >
                            <span>Browse Department</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        {/* Subcategories Grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {activeMegaCategory.subs.map((sub) => (
                            <Link
                              key={sub}
                              to={`${activeMegaCategory.href}&sub=${encodeURIComponent(sub)}`}
                              onClick={() => setShowMegaMenu(false)}
                              className="group p-2.5 rounded-xl hover:bg-[#F6FAF7] border border-transparent hover:border-[#DCE8DF] transition-all flex items-center justify-between"
                            >
                              <span className="text-xs text-slate-700 group-hover:text-[#074428] group-hover:font-semibold transition-colors">
                                {sub}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#074428] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Featured Promo Strip in MegaMenu */}
                      <div className="mt-6 p-4 rounded-2xl bg-[#074428] text-white flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#84CC16]">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-[#84CC16] uppercase tracking-wider">
                              Verified Store
                            </span>
                            <span className="block text-xs font-semibold text-white">
                              Fast multi-market delivery & express dispatch
                            </span>
                          </div>
                        </div>

                        <Link
                          to={ROUTES.PRODUCTS}
                          onClick={() => setShowMegaMenu(false)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#84CC16] hover:bg-[#74B626] text-slate-950 text-xs font-black shrink-0 transition-transform hover:scale-102"
                        >
                          All Products
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to={ROUTES.PRODUCTS}
              className={`hover:text-[#074428] transition-colors ${
                location.pathname === ROUTES.PRODUCTS ? "text-[#074428] font-bold" : ""
              }`}
            >
              All Products
            </Link>

            <Link
              to={ROUTES.ORDERS}
              className={`hover:text-[#074428] transition-colors flex items-center gap-1.5 ${
                location.pathname === ROUTES.ORDERS ? "text-[#074428] font-bold" : ""
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Track Orders</span>
            </Link>

            <Link
              to={ROUTES.CONTACT}
              className={`transition-colors relative py-1 ${
                location.pathname === ROUTES.CONTACT
                  ? "text-[#074428] font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#074428] after:rounded-full"
                  : "hover:text-[#074428]"
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Header Actions matching Image 1 */}
          <div className="flex items-center gap-3">

            {/* Search Toggle Icon */}
            <button
              onClick={toggleSearch}
              aria-label="Search"
              className="p-2 text-slate-700 hover:text-[#074428] hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              aria-label="Cart"
              className="p-2 text-slate-700 hover:text-[#074428] hover:bg-emerald-50 rounded-full transition-colors relative cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart?.itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#84CC16] text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cart.itemCount}
                </span>
              )}
            </button>

            {/* User Account / Profile Icon */}
            <div className="relative" ref={userRef}>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-emerald-50 transition-colors text-slate-700 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#074428] text-white flex items-center justify-center text-xs font-bold">
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#DCE8DF] shadow-xl py-1 z-50 overflow-hidden">
                      <div className="px-3 py-3 border-b border-[#DCE8DF] bg-[#F6FAF7]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#074428] text-white flex items-center justify-center text-sm font-black">
                            {(user?.firstName?.[0] || "U").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={ROUTES.ORDERS}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-600 hover:bg-[#F6FAF7] hover:text-[#074428] transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        My Orders
                      </Link>
                      <Link
                        to={ROUTES.ACCOUNT_PROFILE}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-600 hover:bg-[#F6FAF7] hover:text-[#074428] transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        Profile & Addresses
                      </Link>
                      <Link
                        to={ROUTES.WISHLIST}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-600 hover:bg-[#F6FAF7] hover:text-[#074428] transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        Saved Wishlist
                      </Link>
                      <div className="border-t border-[#DCE8DF] mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
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
                  className="p-2 text-slate-700 hover:text-[#074428] hover:bg-emerald-50 rounded-full transition-colors inline-flex"
                  title="Sign In"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Slide-Down Expandable Search Bar */}
        {showSearch && (
          <div className="border-t border-[#DCE8DF] bg-[#F6FAF7] px-4 sm:px-6 lg:px-8 py-3.5 animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#074428]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search products, SKUs, wholesale categories..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-[#DCE8DF] rounded-xl focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/10 text-[#072115] shadow-xs"
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
                  className="px-5 py-2.5 rounded-xl bg-[#074428] hover:bg-[#0a5634] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="p-2.5 rounded-xl border border-[#DCE8DF] bg-white text-slate-500 hover:text-slate-900 transition-colors"
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
