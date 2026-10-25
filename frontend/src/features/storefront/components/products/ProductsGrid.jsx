import React from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { ProductCard } from "../ProductCard.jsx";
import { ROUTES } from "../../../../constants/routes.js";

export function ProductsGrid({
  products = [],
  isLoading = false,
  gridCols = "standard",
  onClearFilters,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="h-84 rounded-3xl bg-white border border-[#DCE8DF] animate-pulse p-4"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#DCE8DF] p-8 sm:p-14 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center mx-auto">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-[#0F2B1C]">No matching products found</h3>
        <p className="text-xs sm:text-sm text-[#5E7D67] max-w-md mx-auto">
          We couldn't find any products matching your current filters. Try changing your search keywords or resetting departments.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="px-6 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          Clear All Filters & Show Full Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === "compact" ? "lg:grid-cols-4" : "lg:grid-cols-3"
          } gap-4 sm:gap-6`}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
