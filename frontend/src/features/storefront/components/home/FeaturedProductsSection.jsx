import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PackageOpen } from "lucide-react";
import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { ROUTES } from "../../../../constants/routes.js";

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-5 bg-gray-200 rounded w-2/3 mt-1" />
            <div className="h-7 bg-gray-100 rounded-lg mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────────
export function FeaturedProductsSection({
  products = [],
  featuredProducts = [],
  bestSellers = [],
  isLoading = false,
  className = "",
}) {
  // Resolve purely from live API data
  const displayed = useMemo(() => {
    const list = featuredProducts.length > 0
      ? featuredProducts
      : products.length > 0
      ? products
      : bestSellers;
    return (Array.isArray(list) ? list : []).slice(0, 12);
  }, [products, featuredProducts, bestSellers]);

  return (
    <section className={`py-8 sm:py-10 w-full max-w-full overflow-hidden ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 w-full min-w-0">
        {/* ── Header row ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#204B38] tracking-tight">
              Featured Products
            </h2>
            <Link
              to={ROUTES.PRODUCTS}
              className="flex items-center gap-1 text-xs font-bold text-[#358B5B] hover:text-[#204B38] transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Product grid ────────────────────────────────────────── */}
        {isLoading ? (
          <FeaturedSkeleton />
        ) : displayed.length === 0 ? (
          <div className="bg-white/80 rounded-2xl border border-gray-200/80 p-8 text-center space-y-2">
            <PackageOpen className="w-8 h-8 text-[#358B5B] mx-auto opacity-70" />
            <p className="text-sm font-bold text-[#204B38]">No featured products available at this moment</p>
            <p className="text-xs text-gray-500">Check back soon for freshly updated catalog items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {displayed.map((p, i) => (
              <ProductCardCompact
                key={p.id || i}
                product={p}
                badge={p.badge}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProductsSection;
