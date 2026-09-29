import React from "react";
import { Search } from "lucide-react";

export function ProductFilterBar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
  totalProductsCount = 0,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="relative flex-1 max-w-sm w-full">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products by SKU, name or brand..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="p-2 rounded-xl border border-border bg-white text-xs text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="ALL">All Categories ({totalProductsCount})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ProductFilterBar;
