import React from "react";
import { Search, FolderTree, LayoutGrid, ChevronsDown, ChevronsUp } from "lucide-react";

export function CategoriesFilter({
  searchTerm,
  onSearchChange,
  totalCount,
  filteredCount,
  viewMode = "hierarchy",
  onViewModeChange,
  onExpandAll,
  onCollapseAll,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-2xs">
      {/* Search Input */}
      <div className="relative max-w-sm w-full">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search categories or subcategories..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-surface-muted/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00875A] focus:border-[#00875A] transition-all"
        />
      </div>

      {/* Right Controls: Expand/Collapse & View Mode Toggle */}
      <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
        <div className="text-xs text-text-muted font-medium">
          Showing <span className="font-bold text-text-primary">{filteredCount}</span> of {totalCount}
        </div>

        {viewMode === "hierarchy" && (
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={onExpandAll}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white transition-colors cursor-pointer"
              title="Expand All Categories"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Expand All</span>
            </button>
            <button
              type="button"
              onClick={onCollapseAll}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white transition-colors cursor-pointer"
              title="Collapse All Categories"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Collapse All</span>
            </button>
          </div>
        )}

        {/* View Switcher: Hierarchy vs Grid */}
        <div className="flex items-center bg-surface-muted p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => onViewModeChange("hierarchy")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "hierarchy"
                ? "bg-[#00875A] text-white shadow-2xs"
                : "text-text-secondary hover:text-text-primary hover:bg-white/80"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Tree View</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#00875A] text-white shadow-2xs"
                : "text-text-secondary hover:text-text-primary hover:bg-white/80"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
