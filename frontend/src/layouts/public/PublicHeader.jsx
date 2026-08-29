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
    <header className="sticky top-0 z-40">
      {/* ── Top promo strip ── */}
      <div className="bg-[#003876] border-b border-[#00275a]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4">
          <p className="text-[11px] text-[#FFE000] font-semibold tracking-wide hidden sm:block">
            Free pallet freight on orders $2,999+ · NET 30 credit for registered businesses
          </p>
          <div className="flex items-center gap-4 ml-auto">
            <HeaderCountryDropdown
              isOpen={activeDropdown === "country"}
              onToggle={() => toggleDropdown("country")}
              onClose={closeDropdowns}
            />
            <Link
              to="/help"
              className="text-[11px] text-white/70 hover:text-white transition-colors font-medium"
            >
              Help
            </Link>
            <Link
              to="/orders/track"
              className="text-[11px] text-white/70 hover:text-white transition-colors font-medium"
            >
              Order Status
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Header Bar ── */}
      <div className="bg-[#003876] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="shrink-0 flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="Vanom E-Commerce"
                className="h-9 sm:h-10 w-auto object-contain rounded-md group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* All Departments button */}
            <HeaderMegaMenu
              isOpen={activeDropdown === "mega"}
              onToggle={() => toggleDropdown("mega")}
              onClose={closeDropdowns}
              dark
            />

            {/* Search — dominant */}
            <div className="flex-1 max-w-3xl hidden md:block">
              <HeaderSearchBar />
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0">
              {/* Wishlist */}
              <Link
                to={ROUTES.WISHLIST || "/wishlist"}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-white group"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.75]" />
                <span className="text-[10px] font-semibold hidden sm:block">Saved</span>
              </Link>

              {/* User Account */}
              <div className="relative">
                <HeaderUserMenu
                  isOpen={activeDropdown === "user"}
                  onToggle={() => toggleDropdown("user")}
                  onClose={closeDropdowns}
                  dark
                />
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-white relative cursor-pointer"
                aria-label="Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 stroke-[1.75]" />
                  {cart?.itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#FFE000] text-[#003876] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {cart.itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold hidden sm:block">Cart</span>
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-3 md:hidden">
            <HeaderSearchBar />
          </div>
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
