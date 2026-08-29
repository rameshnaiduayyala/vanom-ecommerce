import React from "react";
import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader.jsx";
import { PublicFooter } from "./PublicFooter.jsx";
import { CartDrawer } from "./components/CartDrawer.jsx";

/**
 * Public layout containing global header, main router outlet, footer, and modular mini-cart drawer
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ededed] text-slate-900">
      <PublicHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />

      {/* Reusable Slide-out Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

export default PublicLayout;
