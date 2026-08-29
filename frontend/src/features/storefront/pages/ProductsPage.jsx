import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";
import { Button } from "../../../components/ui/Button.jsx";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

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
    <div className="bg-[#ededed] min-h-screen pb-10">
      {/* Page Header */}
      <div className="bg-[#003876] text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium mb-1.5">
                <span>Home</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white/80">Products</span>
                {currentSearch && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#FFE000]">Search: "{currentSearch}"</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                {currentSearch ? `Results for "${currentSearch}"` : "All Products"}
              </h1>
              <p className="text-xs text-white/50 mt-0.5">
                Showing prices for <span className="font-semibold text-white/80">{country.name} · {country.currency}</span>
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-white/50" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#FFE000] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="text-slate-900 bg-white">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout — rounded white card on gray */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs py-7 px-4 sm:px-7">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-7">
            {/* Sidebar */}
            <aside>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Departments
                  </h4>
                </div>
                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => { searchParams.delete("category"); setSearchParams(searchParams); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      !currentCategory ? "bg-[#003876] text-white font-bold" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Departments</span>
                  </button>
                  {catList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { searchParams.set("category", cat.id); setSearchParams(searchParams); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                        currentCategory === cat.id ? "bg-[#003876] text-white font-bold" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.count && <span className="text-[10px] opacity-50">{cat.count}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="md:col-span-3">
              {/* Result count bar */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200">
                <span className="text-xs text-slate-500 font-medium">
                  {isLoading ? "Loading…" : `${products.length} products found`}
                </span>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <Skeleton key={n} className="h-72 rounded-xl" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  title="No products matched your criteria"
                  description="Try clearing search filters or browsing all departments."
                  action={
                    <Button variant="secondary" size="sm" onClick={() => setSearchParams({})}>
                      Clear Filters
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
