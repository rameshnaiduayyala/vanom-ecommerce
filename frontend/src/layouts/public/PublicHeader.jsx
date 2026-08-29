import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useCartStore } from "../../stores/cart.store.js";
import { ROUTES } from "../../constants/routes.js";
import { HeaderSearchBar } from "./components/HeaderSearchBar.jsx";
import { HeaderMegaMenu } from "./components/HeaderMegaMenu.jsx";
import { HeaderCountryDropdown } from "./components/HeaderCountryDropdown.jsx";
import { HeaderUserMenu } from "./components/HeaderUserMenu.jsx";

export function PublicHeader() {
  const { cart, openCart } = useCartStore();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (name) =>
    setActiveDropdown((prev) => (prev === name ? null : name));

  const closeDropdowns = () => setActiveDropdown(null);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* ── Primary Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo + Mega Menu trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="Vanom"
                className="h-8 sm:h-9 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
            </Link>

            <HeaderMegaMenu
              isOpen={activeDropdown === "mega"}
              onToggle={() => toggleDropdown("mega")}
              onClose={closeDropdowns}
            />
          </div>

          {/* Search Bar — primary action */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <HeaderSearchBar />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
              className="hidden sm:flex w-9 h-9 rounded-lg border border-slate-200 hover:border-slate-300 bg-white items-center justify-center text-slate-500 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
            </Link>

            {/* User Menu */}
            <HeaderUserMenu
              isOpen={activeDropdown === "user"}
              onToggle={() => toggleDropdown("user")}
              onClose={closeDropdowns}
            />

            {/* Cart — Primary CTA */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cart?.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
              {cart?.itemCount > 0 && (
                <span className="hidden sm:inline text-amber-300">({cart.itemCount})</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-3 md:hidden">
          <HeaderSearchBar />
        </div>
      </div>

    </header>
  );
}

export default PublicHeader;
