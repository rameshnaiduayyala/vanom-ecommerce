import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { B2B_NAV_CONFIG } from "../../constants/b2bNav.js";
import { ChevronDown, Headset } from "lucide-react";
import { cn } from "../../utils/cn.js";

export function B2BSidebar({ collapsed = false }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({ "b2b-company": true });

  const isPathActive = (targetPath) => {
    if (!targetPath) return false;
    if (targetPath === "/b2b" || targetPath === "/b2b/dashboard") {
      return location.pathname === "/b2b" || location.pathname === "/b2b/dashboard";
    }
    return location.pathname === targetPath || location.pathname.startsWith(`${targetPath}/`);
  };

  const isParentActive = (item) => {
    if (item.path && isPathActive(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => isPathActive(child.path));
    }
    return false;
  };

  const toggleSubmenu = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside
      className={cn(
        "bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-all duration-200 select-none z-20",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Navigation List ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {B2B_NAV_CONFIG.map((item, idx) => {
          if (item.header) {
            if (collapsed) return <div key={idx} className="h-2" />;
            return (
              <div
                key={idx}
                className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {item.header}
              </div>
            );
          }

          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = Boolean(openMenus[item.id]);
          const parentActive = isParentActive(item);

          // Submenu Group
          if (hasChildren) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer group",
                    parentActive
                      ? "text-gold-400 bg-gold-500/10 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {Icon && (
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          parentActive ? "text-gold-400" : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />
                    )}
                    {!collapsed && <span className="truncate font-semibold">{item.label}</span>}
                  </div>

                  {!collapsed && (
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                        isOpen ? "rotate-180 text-gold-400" : ""
                      )}
                    />
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div className="ml-4 pl-3 border-l border-slate-800 space-y-1 pt-0.5 pb-1">
                    {item.children.map((child) => {
                      const childActive = isPathActive(child.path);
                      const ChildIcon = child.icon;

                      return (
                        <Link
                          key={child.id || child.path}
                          to={child.path}
                          className={cn(
                            "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                            childActive
                              ? "bg-gold-500 text-slate-950 font-bold shadow-xs"
                              : "text-slate-400 hover:text-white hover:bg-slate-800 font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {ChildIcon ? (
                              <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  childActive ? "bg-slate-950" : "bg-slate-600"
                                )}
                              />
                            )}
                            <span className="truncate">{child.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single Nav Link
          const singleActive = isPathActive(item.path);

          return (
            <Link
              key={item.id || item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer group",
                singleActive
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {Icon && (
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      singleActive ? "text-gold-400" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                )}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase leading-none text-slate-950",
                    item.badgeColor || "bg-gold-400"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Footer Support Badge ── */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        {!collapsed ? (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center shrink-0 mt-0.5">
              <Headset className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-200 truncate">Dedicated Wholesale Desk</p>
              <p className="text-[10px] text-slate-400 truncate">b2b-support@vanom.com</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Dedicated Wholesale Desk: b2b-support@vanom.com">
            <Headset className="w-4 h-4 text-gold-400" />
          </div>
        )}
      </div>
    </aside>
  );
}

