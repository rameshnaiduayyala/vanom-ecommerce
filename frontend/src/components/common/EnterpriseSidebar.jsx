import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { BRAND_COLORS } from "../../constants/colors.js";

/**
 * Enterprise Navigation Item Schema:
 * @typedef {Object} NavItem
 * @property {string} id - Unique identifier
 * @property {string} label - Display title
 * @property {React.ComponentType} [icon] - Lucide icon or custom SVG
 * @property {string} [path] - Target route path
 * @property {string|number} [badge] - Counter / notification count
 * @property {string} [badgeColor] - Custom badge background (default rose-500)
 * @property {string} [permission] - RBAC permission required to view
 * @property {string[]} [roles] - Allowed user roles
 * @property {NavItem[]} [children] - Nested sub-menu items
 * @property {string} [header] - Section grouping header title
 */

/**
 * EnterpriseSidebar
 * Reusable, RBAC-aware, fully configurable enterprise sidebar based on react-pro-sidebar.
 *
 * @param {Object} props
 * @param {boolean} props.collapsed - Sidebar collapsed state
 * @param {Function} [props.onToggleCollapse] - Toggle callback
 * @param {NavItem[]} props.navGroups - Navigation items and submenus
 * @param {Object} [props.brand] - Brand logo and title config
 * @param {Object} [props.footer] - Optional sidebar footer component or config
 * @param {string[]} [props.userPermissions] - Current user permissions for RBAC filtering
 * @param {string[]} [props.userRoles] - Current user roles
 * @param {string} [props.bgColor] - Background color (default BRAND_COLORS.DEEP_GREEN)
 * @param {string} [props.activeBgColor] - Active menu item background (default BRAND_COLORS.VANOM_GREEN)
 * @param {string} [props.width] - Sidebar width (default 260px)
 * @param {string} [props.collapsedWidth] - Sidebar collapsed width (default 76px)
 */
export function EnterpriseSidebar({
  collapsed = false,
  onToggleCollapse,
  navGroups = [],
  brand = {
    title: "VANOM",
    subtitle: "Enterprise",
    logoPath: "/admin",
  },
  footer,
  userPermissions = [],
  userRoles = [],
  bgColor = BRAND_COLORS.DEEP_GREEN,
  activeBgColor = BRAND_COLORS.VANOM_GREEN,
  width = "260px",
  collapsedWidth = "76px",
  className = "",
}) {
  const location = useLocation();

  // Helper to check if current route matches
  const isRouteActive = (targetPath) => {
    if (!targetPath) return false;
    if (targetPath === "/admin" || targetPath === "/b2b") {
      return location.pathname === targetPath || location.pathname === `${targetPath}/dashboard`;
    }
    return location.pathname.startsWith(targetPath);
  };

  // RBAC Filter: Checks if user has role/permission for the item
  const canViewItem = (item) => {
    if (userRoles.includes("SUPER_ADMIN")) return true;
    if (item.roles && item.roles.length > 0) {
      const hasRole = item.roles.some((r) => userRoles.includes(r));
      if (!hasRole) return false;
    }
    if (item.permission) {
      if (!userPermissions.includes(item.permission)) return false;
    }
    return true;
  };

  // Filter items recursively by RBAC
  const filterAuthorizedItems = (items = []) => {
    return items
      .filter(canViewItem)
      .map((item) => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: filterAuthorizedItems(item.children),
          };
        }
        return item;
      })
      .filter((item) => !item.children || item.children.length > 0 || item.path);
  };

  const authorizedNav = filterAuthorizedItems(navGroups);

  return (
    <Sidebar
      collapsed={collapsed}
      backgroundColor={bgColor}
      width={width}
      collapsedWidth={collapsedWidth}
      className={className}
      rootStyles={{
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#EAF7F0",
        flexShrink: 0,
        zIndex: 30,
      }}
    >
      {/* ── Brand / Header ── */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-white/10 shrink-0 select-none">
        {!collapsed ? (
          <Link to={brand.logoPath || "/"} className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              {brand.logoSrc ? (
                <img
                  src={brand.logoSrc}
                  alt={brand.title || "Vanom"}
                  className="h-8 w-auto max-w-[180px] object-contain"
                />
              ) : (
                <span className="text-xl font-black tracking-wider text-white">
                  {brand.title || "VANOM"}
                </span>
              )}
            </div>
            {brand.subtitle && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400/80 inline-block" />
                <span>{brand.subtitle}</span>
              </div>
            )}
          </Link>
        ) : (
          <Link to={brand.logoPath || "/"} className="mx-auto">
            {brand.logoSrc ? (
              <img
                src={brand.logoSrc}
                alt="Vanom"
                className="h-7 w-7 object-contain"
              />
            ) : (
              <span className="text-lg font-black text-white">V</span>
            )}
          </Link>
        )}
      </div>

      {/* ── Menu Navigation Items ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-none">
        <Menu
          menuItemStyles={{
            button: ({ active, level }) => ({
              color: active ? "#FFFFFF" : level > 0 ? "#A3D4B0" : "#C1E3C5",
              backgroundColor: active ? activeBgColor : "transparent",
              fontWeight: active ? 600 : 500,
              fontSize: level > 0 ? "12.5px" : "13px",
              borderRadius: "8px",
              margin: level > 0 ? "2px 8px 2px 20px" : "2px 10px",
              padding: "8px 12px",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor: active ? activeBgColor : "rgba(255, 255, 255, 0.08)",
                color: "#FFFFFF",
              },
            }),
            subMenuContent: () => ({
              backgroundColor: "#002A1D",
              padding: "4px 0",
            }),
          }}
        >
          {authorizedNav.map((item) => {
            // Group Header
            if (item.header) {
              if (collapsed) return null;
              return (
                <div
                  key={item.id || item.header}
                  className="px-5 pt-4 pb-1 text-[10px] font-bold text-emerald-300/50 uppercase tracking-wider select-none"
                >
                  {item.header}
                </div>
              );
            }

            const Icon = item.icon;

            // Submenu Item
            if (item.children && item.children.length > 0) {
              const isSubActive = item.children.some((child) => isRouteActive(child.path));
              return (
                <SubMenu
                  key={item.id}
                  label={item.label}
                  icon={Icon ? <Icon className="w-4 h-4 shrink-0" /> : undefined}
                  defaultOpen={isSubActive}
                >
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <MenuItem
                        key={child.id || child.path}
                        active={isRouteActive(child.path)}
                        icon={ChildIcon ? <ChildIcon className="w-3.5 h-3.5 shrink-0" /> : undefined}
                        component={child.path ? <Link to={child.path} /> : undefined}
                        suffix={
                          child.badge !== undefined && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none text-white ${
                                child.badgeColor || "bg-rose-500"
                              }`}
                            >
                              {child.badge}
                            </span>
                          )
                        }
                      >
                        {child.label}
                      </MenuItem>
                    );
                  })}
                </SubMenu>
              );
            }

            // Single Leaf Menu Item
            return (
              <MenuItem
                key={item.id || item.path}
                icon={Icon ? <Icon className="w-4 h-4 shrink-0" /> : undefined}
                active={isRouteActive(item.path)}
                component={item.path ? <Link to={item.path} /> : undefined}
                suffix={
                  item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none text-white ${
                        item.badgeColor || "bg-rose-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )
                }
              >
                {item.label}
              </MenuItem>
            );
          })}
        </Menu>
      </div>

      {/* ── Optional Footer Component ── */}
      {footer ? (
        <div className="border-t border-white/10 shrink-0 bg-[#002D20]">{footer}</div>
      ) : (
        <div className="p-3 border-t border-white/10 shrink-0 bg-[#002D20]">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300">
                <span className="text-xs font-bold">V</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Vanom Platform</p>
                <p className="text-[10px] text-emerald-300/60">Enterprise Edition</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="text-xs font-bold text-emerald-300">V</span>
            </div>
          )}
        </div>
      )}
    </Sidebar>
  );
}

export default EnterpriseSidebar;
