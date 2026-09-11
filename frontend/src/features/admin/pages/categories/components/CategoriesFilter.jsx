import React from "react";
import { Search } from "lucide-react";

export function CategoriesFilter({ searchTerm, onSearchChange, totalCount, filteredCount }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="relative max-w-sm w-full">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search categories by name, slug or description..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>
      <div className="text-xs text-text-muted font-medium">
        Showing <span className="font-bold text-text-primary">{filteredCount}</span> of {totalCount} categories
      </div>
    </div>
  );
}
