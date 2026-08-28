import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { Search, Filter, SlidersHorizontal, Inbox } from "lucide-react";
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

  const products = productsData?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {currentSearch ? `Search Results for "${currentSearch}"` : "All Products"}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Showing retail prices for <span className="font-semibold text-text-primary">{country.name} ({country.currency})</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white border border-border rounded-lg px-2.5 py-1.5 focus:border-brand-500 focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Category Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">Categories</h4>
            <div className="space-y-1">
              <button
                onClick={() => {
                  searchParams.delete("category");
                  setSearchParams(searchParams);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !currentCategory ? "bg-brand-50 text-brand-700 font-semibold" : "text-text-secondary hover:bg-surface-muted"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    searchParams.set("category", cat.id);
                    setSearchParams(searchParams);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    currentCategory === cat.id ? "bg-brand-50 text-brand-700 font-semibold" : "text-text-secondary hover:bg-surface-muted"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-text-muted">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products matched your criteria"
              description="Try clearing search filters or changing the category."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchParams({})}
                >
                  Clear Filters
                </Button>
              }
            />
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
  );
}
