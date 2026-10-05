import React, { useMemo } from "react";
import {
  FolderTree,
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  Tag,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  CornerDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";

export function CategoryHierarchyView({
  categories = [],
  isLoading = false,
  onEdit,
  onDelete,
  onAddSubcategory,
  searchTerm = "",
  expandedCategories = {},
  onToggleExpand,
}) {
  // Build parent-child tree structure from the category array
  const { rootGroups, orphanChildren } = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    // Map all categories by id for quick lookup
    const categoryMap = new Map();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, cat);
    });

    // Find all root categories (no parentId or parentId not present in dataset)
    const roots = [];
    const childrenByParent = new Map();
    const orphans = [];

    categories.forEach((cat) => {
      if (!cat.parentId) {
        roots.push(cat);
      } else {
        if (!childrenByParent.has(cat.parentId)) {
          childrenByParent.set(cat.parentId, []);
        }
        childrenByParent.get(cat.parentId).push(cat);
      }
    });

    // Check if any child has a parentId that does not exist in categoryMap
    childrenByParent.forEach((childrenList, parentId) => {
      if (!categoryMap.has(parentId)) {
        orphans.push(...childrenList);
      }
    });

    // Sort roots by sortOrder ascending, then name
    roots.sort((a, b) => {
      const orderA = a.sortOrder ?? 0;
      const orderB = b.sortOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || "").localeCompare(b.name || "");
    });

    // For each root, build group with its sorted children
    const groups = roots
      .map((parent) => {
        // Collect children from both childrenByParent and parent.children if any
        const directChildren = childrenByParent.get(parent.id) || [];
        const rawChildrenFromObj = Array.isArray(parent.children) ? parent.children : [];

        // Deduplicate children by ID
        const childMap = new Map();
        [...rawChildrenFromObj, ...directChildren].forEach((child) => {
          if (child && child.id) {
            // merge with full data if available
            const fullChild = categoryMap.get(child.id) || child;
            childMap.set(child.id, fullChild);
          }
        });

        const children = Array.from(childMap.values()).sort((a, b) => {
          const orderA = a.sortOrder ?? 0;
          const orderB = b.sortOrder ?? 0;
          if (orderA !== orderB) return orderA - orderB;
          return (a.name || "").localeCompare(b.name || "");
        });

        // Filter based on searchTerm
        const parentMatches =
          !term ||
          parent.name?.toLowerCase().includes(term) ||
          parent.slug?.toLowerCase().includes(term) ||
          parent.description?.toLowerCase().includes(term);

        const matchingChildren = children.filter(
          (c) =>
            !term ||
            c.name?.toLowerCase().includes(term) ||
            c.slug?.toLowerCase().includes(term) ||
            c.description?.toLowerCase().includes(term)
        );

        const isVisible = parentMatches || matchingChildren.length > 0;
        const autoExpand = Boolean(term && matchingChildren.length > 0);

        return {
          parent,
          children: term && !parentMatches ? matchingChildren : children,
          allChildrenCount: children.length,
          totalProductsCount:
            (parent.count || 0) +
            children.reduce((acc, c) => acc + (c.count || c._count?.products || 0), 0),
          isVisible,
          autoExpand,
        };
      })
      .filter((group) => group.isVisible);

    return { rootGroups: groups, orphanChildren: orphans };
  }, [categories, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border border-border animate-pulse flex flex-col gap-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100" />
                <div className="space-y-2">
                  <div className="w-36 h-4 bg-slate-100 rounded" />
                  <div className="w-24 h-3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-20 h-7 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rootGroups.length === 0 && orphanChildren.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-border shadow-2xs">
        <FolderTree className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
        <h3 className="text-base font-bold text-text-primary">No categories found</h3>
        <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
          {searchTerm
            ? "No categories match your search. Try changing the keywords or clearing filters."
            : "Get started by adding your first root category taxonomy."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {rootGroups.map(({ parent, children, allChildrenCount, totalProductsCount, autoExpand }) => {
        const isExpanded =
          autoExpand ||
          (expandedCategories[parent.id] !== undefined
            ? expandedCategories[parent.id]
            : true);

        return (
          <div
            key={parent.id}
            className="bg-white rounded-2xl border border-border/90 shadow-2xs overflow-hidden transition-all duration-200 hover:border-[#00875A]/40"
          >
            {/* ── Root Category Header Bar ── */}
            <div
              className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                isExpanded ? "bg-[#FBFDFB] border-b border-border/80" : "bg-white"
              }`}
            >
              {/* Left: Expand Trigger, Image, Names, Badges */}
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                {/* Expand / Collapse Button */}
                <button
                  type="button"
                  onClick={() => onToggleExpand(parent.id)}
                  className="w-8 h-8 rounded-lg bg-surface-muted hover:bg-[#EAF5EF] hover:text-[#00875A] border border-border flex items-center justify-center text-text-secondary transition-colors cursor-pointer shrink-0 mt-1 sm:mt-0"
                  title={isExpanded ? "Collapse Subcategories" : "Expand Subcategories"}
                  aria-label="Toggle subcategories"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isExpanded ? "rotate-0 text-[#00875A]" : "-rotate-90"
                    }`}
                  />
                </button>

                {/* Category Thumbnail / Avatar */}
                <div className="relative shrink-0">
                  {parent.imageUrl ? (
                    <img
                      src={parent.imageUrl}
                      alt={parent.name}
                      className="w-12 h-12 rounded-xl object-cover border border-border/80 bg-surface-muted shadow-2xs"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EAF5EF] to-[#D5EBDC] text-[#00875A] flex items-center justify-center font-black text-base border border-[#D5EBDC] shadow-2xs">
                      {parent.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00875A] text-white flex items-center justify-center text-[9px] font-black shadow-xs ring-2 ring-white"
                    title="Root Category"
                  >
                    ★
                  </span>
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base text-text-primary tracking-tight truncate">
                      {parent.name}
                    </h3>

                    <Badge
                      variant="outline"
                      size="sm"
                      className="text-[10px] font-bold bg-[#EAF5EF] text-[#006B3C] border-[#B7E0CA]"
                    >
                      Parent Category
                    </Badge>

                    {parent.active === false && (
                      <Badge variant="warning" size="sm" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-1 text-[11px] text-text-muted">
                    <span className="font-mono bg-surface-muted px-2 py-0.5 rounded text-text-secondary border border-border/60">
                      /{parent.slug}
                    </span>

                    <span className="inline-flex items-center gap-1 font-mono font-bold bg-[#EBF3EF] text-[#006B3C] px-2 py-0.5 rounded border border-[#D5E4DB]">
                      <Tag className="w-3 h-3 text-[#00875A]" />
                      Order: {parent.sortOrder ?? 0}
                    </span>

                    <span className="inline-flex items-center gap-1 font-semibold text-text-secondary">
                      <Package className="w-3 h-3 text-text-muted" />
                      {parent.count || 0} Products
                    </span>

                    <span className="inline-flex items-center gap-1 font-semibold text-text-secondary">
                      <Layers className="w-3 h-3 text-[#00875A]" />
                      {allChildrenCount} Subcategories
                    </span>
                  </div>

                  {parent.description && (
                    <p className="text-xs text-text-muted mt-1.5 line-clamp-1 max-w-2xl">
                      {parent.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60 w-full lg:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  icon={FolderPlus}
                  onClick={() => onAddSubcategory(parent)}
                  className="text-xs font-bold text-[#00875A] border-[#C3E4D1] hover:bg-[#EAF5EF] cursor-pointer"
                >
                  Add Subcategory
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit2}
                  onClick={() => onEdit(parent)}
                  className="text-xs font-semibold cursor-pointer"
                  title="Edit Root Category"
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => onDelete(parent)}
                  className="text-xs font-semibold cursor-pointer"
                  title="Delete Category"
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* ── Subcategories Branch Tree (Visible when expanded) ── */}
            {isExpanded && (
              <div className="p-4 sm:p-6 bg-[#FAFCFA] border-t border-dashed border-[#DDE7E1]">
                {children.length > 0 ? (
                  <div className="space-y-3 relative pl-4 sm:pl-7">
                    {/* Visual Vertical Connecting Tree Guide Line */}
                    <div className="absolute left-2 sm:left-4 top-2 bottom-6 w-0.5 bg-gradient-to-b from-[#00875A]/40 via-[#B0D8C4] to-transparent rounded-full pointer-events-none" />

                    {children.map((child, idx) => (
                      <div
                        key={child.id || `${child.slug}-${idx}`}
                        className="relative flex items-stretch group"
                      >
                        {/* Visual Horizontal Branch Connector */}
                        <div className="absolute -left-2 sm:-left-3 top-5 w-4 sm:w-5 h-0.5 bg-[#B0D8C4] rounded-full pointer-events-none" />
                        <div className="absolute -left-2.5 sm:-left-3.5 top-[18px] w-1.5 h-1.5 rounded-full bg-[#00875A] ring-2 ring-white pointer-events-none" />

                        {/* Subcategory Card */}
                        <div className="w-full bg-white rounded-xl border border-border/90 hover:border-[#00875A]/50 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group-hover:shadow-xs transition-all duration-200">
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-center gap-3 min-w-0">
                            {child.imageUrl ? (
                              <img
                                src={child.imageUrl}
                                alt={child.name}
                                className="w-10 h-10 rounded-lg object-cover border border-border shrink-0 bg-surface-muted"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-surface-muted text-text-muted flex items-center justify-center font-bold text-xs border border-border shrink-0">
                                <CornerDownRight className="w-4 h-4 text-[#00875A]" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-xs sm:text-sm text-text-primary group-hover:text-[#00875A] transition-colors truncate">
                                  {child.name}
                                </h4>

                                {child.isActive === false && (
                                  <Badge variant="warning" size="sm" className="text-[9px]">
                                    Inactive
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap mt-0.5 text-[10px] text-text-muted">
                                <span className="font-mono bg-surface-muted px-1.5 py-0.5 rounded border border-border/50">
                                  /{child.slug}
                                </span>

                                <span className="font-mono font-bold bg-[#EAF5EF] text-[#006B3C] px-1.5 py-0.5 rounded border border-[#D5E4DB]">
                                  Order: {child.sortOrder ?? 0}
                                </span>

                                <span className="font-medium text-text-secondary">
                                  {child.count !== undefined
                                    ? child.count
                                    : child._count?.products || 0}{" "}
                                  Products
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Subcategory Actions */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Edit2}
                              onClick={() => onEdit(child)}
                              className="text-xs text-text-secondary hover:text-[#00875A] hover:bg-[#EAF5EF] h-8 px-2.5 cursor-pointer"
                              title="Edit Subcategory"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => onDelete(child)}
                              className="text-xs text-text-secondary hover:text-rose-600 hover:bg-rose-50 h-8 px-2.5 cursor-pointer"
                              title="Delete Subcategory"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty state for root category with no subcategories */
                  <div className="border border-dashed border-[#C3DCCF] bg-white/70 rounded-xl p-5 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                      <Folder className="w-4 h-4 text-[#00875A]" />
                      <span>
                        No subcategories under{" "}
                        <strong className="text-text-primary">{parent.name}</strong> yet.
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={() => onAddSubcategory(parent)}
                      className="text-xs font-bold text-[#00875A] border-[#B7E0CA] hover:bg-[#EAF5EF] cursor-pointer"
                    >
                      Add First Subcategory
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Standalone / Orphan Subcategories (if any) ── */}
      {orphanChildren.length > 0 && (
        <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
              Unassigned / Standalone Subcategories ({orphanChildren.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orphanChildren.map((child) => (
              <div
                key={child.id}
                className="bg-white rounded-xl border border-amber-200/80 p-3 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-text-primary truncate">{child.name}</div>
                  <div className="text-[10px] text-text-muted font-mono truncate">/{child.slug}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    onClick={() => onEdit(child)}
                    className="h-7 w-7 p-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => onDelete(child)}
                    className="h-7 w-7 p-0 text-rose-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryHierarchyView;
