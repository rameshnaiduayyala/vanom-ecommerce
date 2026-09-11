import React from "react";
import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader.jsx";
import { PublicFooter } from "./PublicFooter.jsx";
import { AnnouncementBar } from "../../features/storefront/components/AnnouncementBar.jsx";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7DD] text-text-primary">
      <AnnouncementBar />
      <PublicHeader />
      <main className="flex-1 bg-[#FFF7DD]">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
