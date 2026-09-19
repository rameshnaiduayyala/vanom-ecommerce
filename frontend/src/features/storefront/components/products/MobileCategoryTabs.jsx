import React from "react";

export function MobileCategoryTabs({
  categories = [],
  currentCategory,
  totalProductsCount = 0,
  onSelectCategory,
  onClearCategory,
}) {
  return (
    <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
      <button
        onClick={onClearCategory}
        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          !currentCategory
            ? "bg-[#00875A] text-white shadow-xs"
            : "bg-white text-[#3D5648] border border-[#DCE8DF] hover:bg-[#F0F7F1]"
        }`}
      >
        All Departments ({totalProductsCount})
      </button>
      {categories.map((cat) => {
        const isSelected = currentCategory === cat.id || currentCategory === cat.slug;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isSelected
                ? "bg-[#00875A] text-white font-bold shadow-xs"
                : "bg-white text-[#3D5648] border border-[#DCE8DF] hover:bg-[#F0F7F1]"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
