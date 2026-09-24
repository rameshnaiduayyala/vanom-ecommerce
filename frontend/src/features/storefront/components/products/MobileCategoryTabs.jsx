import React from "react";

export function MobileCategoryTabs({
  categories = [],
  currentCategory,
  totalProductsCount = 0,
  onSelectCategory,
  onClearCategory,
}) {
  // Find if a selected category has children or belongs to a parent
  const activeParent = categories.find(
    (c) =>
      c.id === currentCategory ||
      c.slug === currentCategory ||
      (Array.isArray(c.children) && c.children.some((sub) => sub.id === currentCategory || sub.slug === currentCategory))
  );

  return (
    <div className="lg:hidden space-y-2 pb-2">
      {/* Primary Parent Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        <button
          onClick={onClearCategory}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            !currentCategory
              ? "bg-[#00875A] text-white shadow-xs"
              : "bg-white text-[#3D5648] border border-[#DCE8DF] hover:bg-[#F0F7F1]"
          }`}
        >
          All ({totalProductsCount})
        </button>
        {categories.map((cat) => {
          const isSelected =
            currentCategory === cat.id ||
            currentCategory === cat.slug ||
            (Array.isArray(cat.children) && cat.children.some((sub) => sub.id === currentCategory || sub.slug === currentCategory));

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Subcategory Secondary Pills when Parent is Active */}
      {activeParent && Array.isArray(activeParent.children) && activeParent.children.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 pt-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 pr-1">
            Subcategories:
          </span>
          <button
            onClick={() => onSelectCategory(activeParent.id)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              currentCategory === activeParent.id || currentCategory === activeParent.slug
                ? "bg-[#E6F4EA] text-[#00875A] font-bold border border-[#00875A]/30"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All {activeParent.name}
          </button>
          {activeParent.children.map((sub) => {
            const isSubSelected = currentCategory === sub.id || currentCategory === sub.slug;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectCategory(sub.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSubSelected
                    ? "bg-[#00875A] text-white font-bold shadow-2xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
