import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { Search, Filter, SlidersHorizontal, Package, Sparkles } from "lucide-react";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { country } = useCountryStore();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("popular");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products-list", currentCategory, currentSearch, country.code],
    queryFn: () => Api.catalog.getProducts({ category: currentCategory, search: currentSearch }),
  });

  const catList = Array.isArray(categories) ? categories : (categories?.items || []);
  const products = Array.isArray(productsData?.items) ? productsData.items : (Array.isArray(productsData) ? productsData : []);

  return (
    <div className="bg-[#F8FAF9] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Filter Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE8DF] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EA] text-[#00875A] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE GLOBAL CATALOG</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2B1C] tracking-tight">
              {currentSearch ? `Search Results for "${currentSearch}"` : "All Verified Products"}
            </h1>
            <p className="text-xs text-[#5E7D67]">
              Showing direct retail pricing & express delivery options for{" "}
              <span className="font-semibold text-[#0F2B1C]">
                {country.flag} {country.name} ({country.currency})
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl px-3 py-2">
              <SlidersHorizontal className="w-4 h-4 text-[#5E7D67]" />
              <span className="text-xs font-semibold text-[#5E7D67]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-transparent border-none text-[#0F2B1C] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Category Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-[#DCE8DF] p-5 shadow-xs">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F2B1C] mb-4 pb-2 border-b border-[#E8EDE9] flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#00875A]" />
                <span>Departments</span>
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    searchParams.delete("category");
                    setSearchParams(searchParams);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    !currentCategory
                      ? "bg-[#E6F4EA] text-[#00875A] shadow-2xs font-bold"
                      : "text-[#3D5648] hover:bg-[#F0F7F1] hover:text-[#00875A]"
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70">
                    {products.length}
                  </span>
                </button>
                {catList.map((cat) => {
                  const isSelected = currentCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        searchParams.set("category", cat.id);
                        setSearchParams(searchParams);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#E6F4EA] text-[#00875A] shadow-2xs font-bold"
                          : "text-[#3D5648] hover:bg-[#F0F7F1] hover:text-[#00875A]"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F7F4] text-[#5E7D67]">
                        {cat.count || 12}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality & Dispatch Assurance Card */}
            <div className="p-5 rounded-3xl bg-[#064027] text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-[#4ADE80] font-bold text-xs uppercase tracking-wider">
                <Package className="w-4 h-4" />
                <span>DIRECT DISPATCH</span>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                All catalog items are verified for authentic multi-market delivery across US and UK regions.
              </p>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-80 rounded-3xl bg-white border border-[#DCE8DF] animate-pulse p-4" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#DCE8DF] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#0F2B1C]">No products found</h3>
                <p className="text-xs text-[#5E7D67] max-w-sm mx-auto">
                  No products matched your selected category or search term. Try resetting your filters.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="px-5 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
