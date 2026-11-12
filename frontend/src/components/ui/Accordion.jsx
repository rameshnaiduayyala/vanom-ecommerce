import React, { createContext, useContext, useId, useMemo, useState } from "react";
import { ChevronDown, Search, ChevronsUpDown } from "lucide-react";
import { cn } from "../../utils/cn.js";

const AccordionContext = createContext(null);

const VARIANT_STYLES = {
  card: {
    root: "space-y-2.5",
    item: "rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all duration-200 overflow-hidden",
    itemOpen: "border-emerald-500/40 ring-1 ring-emerald-500/15 shadow-xs",
    trigger: "hover:bg-slate-50/70",
  },
  bordered: {
    root: "rounded-2xl bg-white border border-slate-200/90 divide-y divide-slate-100 shadow-2xs overflow-hidden",
    item: "transition-colors duration-150",
    itemOpen: "bg-emerald-50/15",
    trigger: "hover:bg-slate-50/70",
  },
  ghost: {
    root: "divide-y divide-slate-200/70",
    item: "",
    itemOpen: "",
    trigger: "hover:bg-slate-50/60 rounded-xl",
  },
};

const SIZE_STYLES = {
  sm: {
    trigger: "px-3.5 py-2.5 gap-2.5",
    title: "text-xs font-bold",
    subtitle: "text-[11px]",
    content: "px-3.5 pb-3 pt-1 text-xs",
    iconBox: "w-7 h-7 rounded-lg",
  },
  md: {
    trigger: "px-4 py-3.5 gap-3",
    title: "text-sm font-bold",
    subtitle: "text-xs",
    content: "px-4 pb-4 pt-1 text-sm",
    iconBox: "w-8 h-8 rounded-xl",
  },
  lg: {
    trigger: "px-5 py-4 gap-3.5",
    title: "text-base font-bold",
    subtitle: "text-xs",
    content: "px-5 pb-5 pt-1.5 text-sm",
    iconBox: "w-9 h-9 rounded-xl",
  },
};

function normalizeToSet(val, multiple) {
  if (val == null) return new Set();
  if (Array.isArray(val)) return new Set(multiple ? val : val.slice(0, 1));
  return new Set([val]);
}

/**
 * Smart, accessible, reusable Accordion.
 * Supports both data-driven (`items={[...]}`) and composable (`<AccordionItem>`) usage.
 */
export function Accordion({
  items,
  children,
  multiple = false,
  value,
  defaultValue,
  onChange,
  variant = "card",
  size = "md",
  searchable = false,
  searchPlaceholder = "Filter sections...",
  allowToggleAll = false,
  headerContent = null,
  keepMounted = false,
  className,
}) {
  const isControlled = value !== undefined;
  const [internalOpen, setInternalOpen] = useState(() =>
    normalizeToSet(defaultValue, multiple)
  );
  const [searchQuery, setSearchQuery] = useState("");

  const openSet = useMemo(
    () => (isControlled ? normalizeToSet(value, multiple) : internalOpen),
    [isControlled, value, internalOpen, multiple]
  );

  const commitSet = (nextSet) => {
    if (!isControlled) {
      setInternalOpen(nextSet);
    }
    if (onChange) {
      const arr = Array.from(nextSet);
      onChange(multiple ? arr : arr[0] ?? null);
    }
  };

  const toggleItem = (id) => {
    const next = new Set(multiple ? openSet : []);
    if (openSet.has(id)) {
      if (multiple) next.delete(id);
    } else {
      next.add(id);
    }
    commitSet(next);
  };

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return null;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const titleText = typeof item.title === "string" ? item.title.toLowerCase() : "";
      const subText = typeof item.subtitle === "string" ? item.subtitle.toLowerCase() : "";
      const contentText = typeof item.content === "string" ? item.content.toLowerCase() : "";
      return titleText.includes(q) || subText.includes(q) || contentText.includes(q);
    });
  }, [items, searchQuery]);

  const allExpandableIds = useMemo(() => {
    if (!Array.isArray(filteredItems)) return [];
    return filteredItems.filter((it) => !it.disabled).map((it) => it.id);
  }, [filteredItems]);

  const allExpanded =
    allExpandableIds.length > 0 && allExpandableIds.every((id) => openSet.has(id));

  const handleToggleAll = () => {
    commitSet(allExpanded ? new Set() : new Set(allExpandableIds));
  };

  const vStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.card;
  const sStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <AccordionContext.Provider
      value={{ openSet, toggleItem, vStyle, sStyle, keepMounted }}
    >
      <div className={cn("w-full space-y-3", className)}>
        {(headerContent || searchable || (allowToggleAll && multiple && Array.isArray(items))) && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {headerContent}
            {searchable && (
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all"
                />
              </div>
            )}

            {allowToggleAll && multiple && allExpandableIds.length > 1 && (
              <button
                type="button"
                onClick={handleToggleAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                {allExpanded ? "Collapse All" : "Expand All"}
              </button>
            )}
          </div>
        )}

        <div className={vStyle.root}>
          {Array.isArray(filteredItems)
            ? filteredItems.length === 0
              ? (
                <div className="p-6 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                  No matching sections found.
                </div>
                )
              : filteredItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    icon={item.icon}
                    badge={item.badge}
                    rightContent={item.rightContent}
                    disabled={item.disabled}
                  >
                    {item.content}
                  </AccordionItem>
                ))
            : children}
        </div>
      </div>
    </AccordionContext.Provider>
  );
}

/**
 * Individual collapsible panel inside `<Accordion>`.
 */
export function AccordionItem({
  id,
  title,
  subtitle,
  icon: Icon,
  badge,
  rightContent,
  disabled = false,
  className,
  children,
}) {
  const ctx = useContext(AccordionContext);
  const reactId = useId();
  const itemId = id ?? reactId;
  const triggerId = `${reactId}-trigger`;
  const panelId = `${reactId}-panel`;

  if (!ctx) {
    throw new Error("AccordionItem must be rendered inside an <Accordion>");
  }

  const { openSet, toggleItem, vStyle, sStyle, keepMounted } = ctx;
  const isOpen = openSet.has(itemId);

  return (
    <div
      className={cn(
        vStyle.item,
        isOpen && vStyle.itemOpen,
        disabled && "opacity-60",
        className
      )}
    >
      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => !disabled && toggleItem(itemId)}
        className={cn(
          "w-full flex items-center justify-between text-left transition-colors cursor-pointer disabled:cursor-not-allowed select-none",
          sStyle.trigger,
          !disabled && vStyle.trigger
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {Icon && (
            <div
              className={cn(
                "shrink-0 flex items-center justify-center transition-colors",
                sStyle.iconBox,
                isOpen
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              )}
            >
              {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-slate-900 leading-snug",
                  sStyle.title,
                  isOpen && "text-emerald-950"
                )}
              >
                {title}
              </span>
              {badge}
            </div>
            {subtitle && (
              <p className={cn("text-slate-500 mt-0.5 truncate", sStyle.subtitle)}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-2">
          {rightContent}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200 ease-out",
              isOpen && "rotate-180 text-emerald-700"
            )}
          />
        </div>
      </button>

      {/* Smooth CSS Grid-Row Collapse/Expand */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={cn(
          "grid transition-all duration-200 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {(isOpen || keepMounted) && (
            <div className={cn("text-slate-600 leading-relaxed", sStyle.content)}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Accordion;
