import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Building2, Package, Sparkles } from "lucide-react";
import { useCartStore } from "../../stores/cart.store.js";
import { ROUTES } from "../../constants/routes.js";
import { HeaderSearchBar } from "./components/HeaderSearchBar.jsx";
import { HeaderMegaMenu } from "./components/HeaderMegaMenu.jsx";
import { HeaderCountryDropdown } from "./components/HeaderCountryDropdown.jsx";
import { HeaderUserMenu } from "./components/HeaderUserMenu.jsx";

export function PublicHeader() {
  const { cart, openCart } = useCartStore();
  const [activeDropdown, setActiveDropdown] = useState(null); // 'mega' | 'country' | 'user' | null

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const closeDropdowns = () => setActiveDropdown(null);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Category Mega Menu */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="Vanom"
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            <HeaderMegaMenu
              isOpen={activeDropdown === "mega"}
              onToggle={() => toggleDropdown("mega")}
              onClose={closeDropdowns}
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <HeaderSearchBar />
          </div>

          {/* User Controls & Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Country Selector */}
            <HeaderCountryDropdown
              isOpen={activeDropdown === "country"}
              onToggle={() => toggleDropdown("country")}
              onClose={closeDropdowns}
            />

            {/* Wishlist */}
            <Link
              to={ROUTES.WISHLIST || "/wishlist"}
              aria-label="Wishlist"
              className="hidden sm:flex w-9 h-9 rounded-xl border border-border bg-surface-muted hover:bg-slate-100 items-center justify-center text-text-secondary hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
            </Link>

            {/* User Profile / Auth */}
            <HeaderUserMenu
              isOpen={activeDropdown === "user"}
              onToggle={() => toggleDropdown("user")}
              onClose={closeDropdowns}
            />

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cart?.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cart.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <HeaderSearchBar />
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
