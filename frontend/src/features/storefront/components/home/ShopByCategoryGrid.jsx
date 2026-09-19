import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid } from "lucide-react";

export function ShopByCategoryGrid({ categories = [], className = "" }) {
  const items = Array.isArray(categories) ? categories : [];

  return (
    <section className={`py-10 bg-white/60 ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-bold text-[#006B3C] hover:text-[#003D2B] transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
            <LayoutGrid className="w-8 h-8 text-[#006B3C] mx-auto opacity-70" />
            <p className="text-sm font-bold text-gray-800">No categories found</p>
            <p className="text-xs text-gray-500">Categories will appear here as soon as they are added to the catalog.</p>
          </div>
        ) : (
          /* Category Grid: 5 columns on desktop */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {items.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id || cat.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-[#006B3C]/30 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Image Container */}
                <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold text-lg">
                      {cat.name}
                    </div>
                  )}
                </div>

                {/* Text Info Below Image */}
                <div className="p-3.5 flex flex-col gap-0.5">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#006B3C] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-[10px] sm:text-[11px] text-gray-500 leading-snug truncate">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ShopByCategoryGrid;
