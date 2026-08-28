import React from "react";
import { Outlet } from "react-router-dom";
import { B2BHeader } from "./B2BHeader.jsx";
import { B2BSidebar } from "./B2BSidebar.jsx";

export function B2BLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <B2BHeader />
      <div className="flex flex-1">
        <B2BSidebar />
        <main className="flex-1 bg-slate-900/40 p-6 overflow-y-auto min-w-0">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
