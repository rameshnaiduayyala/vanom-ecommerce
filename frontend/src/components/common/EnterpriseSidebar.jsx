import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Circle } from "lucide-react";
import { BRAND_COLORS } from "../../constants/colors.js";

/**
 * EnterpriseSidebar
 * Simple, clean, and elegant enterprise sidebar with smooth collapsible sub-items.
 */
export function EnterpriseSidebar({
  collapsed = false,
  navGroups = [],
  brand = {
    title: "VANOM",
    subtitle: "Admin Portal",
    logoPath: "/admin/dashboard",
  },
  footer,
  width = "260px",
  collapsedWidth = "76px",
  className = "",
}) {
  const location = useLocation();

  // Helper to test if a route path is currently active
  const isPathActive = (targetPath) => {
    if (!targetPath) return false;
    const currentFull = location.pathname + location.search;

    if (targetPath.includes("?")) {
      return currentFull === targetPath;
    }
    if (targetPath === "/admin" || targetPath === "/admin/dashboard") {
      return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
    }
    return location.pathname === targetPath || location.pathname.startsWith(`${targetPath}/`);
  };

  // Check if any child of a parent item is active
  const isParentActive = (item) => {
    if (item.path && isPathActive(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => isPathActive(child.path));
    }
    return false;
  };

  // Initialize open submenus based on active route
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const initialOpen = {};
    navGroups.forEach((group) => {
      if (group.children && isParentActive(group)) {
        initialOpen[group.id] = true;
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...initialOpen }));
  }, [location.pathname, location.search]);

  const toggleSubmenu = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside
      style={{ width: collapsed ? collapsedWidth : width }}
      className={`h-screen flex flex-col bg-[#0F241A] text-slate-200 border-r border-white/10 shrink-0 transition-all duration-200 select-none z-30 ${className}`}
    >
      {/* ── Brand Header ── */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-white/10 shrink-0">
        {!collapsed ? (
          <Link
            to={brand.logoPath || "/admin/dashboard"}
            className="flex items-center gap-3 min-w-0 group"
          >
            {brand.logoSrc ? (
              <img
                src={brand.logoSrc}
                alt={brand.title || "Vanom"}
                className="h-8 w-auto max-w-[140px] object-contain brightness-0 invert"
              />
            ) : (
              <span className="text-lg font-black tracking-wider text-white">
                {brand.title || "VANOM"}
              </span>
            )}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admin</span>
            </div>
          </Link>
        ) : (
          <Link
            to={brand.logoPath || "/admin/dashboard"}
            className="mx-auto w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-black text-white hover:bg-white/15 transition-colors"
          >
            V
          </Link>
        )}
      </div>

      {/* ── Navigation List ── */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {navGroups.map((item, idx) => {
          // Section Header
          if (item.header) {
            if (collapsed) return <div key={idx} className="h-2" />;
            return (
              <div
                key={idx}
                className="px-3 pt-3 pb-1 text-[10px] font-bold text-emerald-400/50 uppercase tracking-wider"
              >
                {item.header}
              </div>
            );
          }

          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = Boolean(openMenus[item.id]);
          const parentActive = isParentActive(item);

          // Submenu Parent Item
          if (hasChildren) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer group ${
                    parentActive
                      ? "text-white bg-white/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          parentActive
                            ? "text-emerald-400"
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                    )}
                    {!collapsed && (
                      <span className="truncate font-semibold">{item.label}</span>
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none text-white ${
                            item.badgeColor || "bg-emerald-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </div>
                  )}
                </button>

                {/* Submenu Dropdown List */}
                {!collapsed && isOpen && (
                  <div className="ml-4 pl-3 border-l border-emerald-500/20 space-y-1 pt-0.5 pb-1 animate-in fade-in-50 duration-150">
                    {item.children.map((child) => {
                      const childActive = isPathActive(child.path);
                      const ChildIcon = child.icon;

                      return (
                        <Link
                          key={child.id || child.path}
                          to={child.path}
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            childActive
                              ? "bg-[#358B5B] text-white font-bold shadow-xs"
                              : "text-slate-300 hover:text-white hover:bg-white/5 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {ChildIcon ? (
                              <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  childActive ? "bg-white" : "bg-emerald-400/40"
                                }`}
                              />
                            )}
                            <span className="truncate">{child.label}</span>
                          </div>

                          {child.badge !== undefined && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none text-white ${
                                child.badgeColor || "bg-amber-500"
                              }`}
                            >
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single Link Item (e.g., Dashboard)
          const singleActive = isPathActive(item.path);

          return (
            <Link
              key={item.id || item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer group ${
                singleActive
                  ? "bg-[#358B5B] text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-white/5 font-medium"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {Icon && (
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      singleActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                )}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none text-white ${
                    item.badgeColor || "bg-rose-500"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {footer ? (
        <div className="border-t border-white/10 shrink-0 bg-[#0B1C14]">{footer}</div>
      ) : (
        <div className="p-3 border-t border-white/10 shrink-0 bg-[#0B1C14]">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300 text-xs font-bold">
                V
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Vanom Console</p>
                <p className="text-[10px] text-emerald-400/60">v1.2.0 • Live</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="text-xs font-bold text-emerald-400">V</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default EnterpriseSidebar;

