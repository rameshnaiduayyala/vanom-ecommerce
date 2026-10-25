import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { SEO } from "../../../components/common/SEO.jsx";
import { ProductsHeaderBar } from "../components/products/ProductsHeaderBar.jsx";
import { ProductsSidebar } from "../components/products/ProductsSidebar.jsx";
import { MobileCategoryTabs } from "../components/products/MobileCategoryTabs.jsx";
import { ProductsGrid } from "../components/products/ProductsGrid.jsx";

const PAGE_SIZE = 20;

export function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const { country } = useCountryStore();

  const currentCategory = slug || searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("popular");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [gridCols, setGridCols] = useState("standard");

  const { data: categories = [] } = useQuery({
    queryKey: ["category-tree"],
    queryFn: async () => {
      const res = await Api.catalog.getCategoryTree();
      const tree = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (tree.length > 0) return tree;
      const flat = await Api.catalog.getCategories();
      return Array.isArray(flat?.data) ? flat.data : Array.isArray(flat?.items) ? flat.items : Array.isArray(flat) ? flat : [];
    },
  });

  const { data: allCatalogData } = useQuery({
    queryKey: ["all-products-count", country.code],
    queryFn: () => Api.catalog.getProducts({ limit: 1 }),
  });

  const totalCatalogCount = allCatalogData?.total ?? allCatalogData?.meta?.total ?? 0;

  // ── Infinite Query with 20 products per page and cursor pagination ──
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["products-infinite", currentCategory, currentSearch, country.code],
    queryFn: async ({ pageParam = null }) => {
      const params = {
        limit: PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {}),
        ...(currentCategory ? { categoryId: currentCategory } : {}),
        ...(currentSearch ? { search: currentSearch } : {}),
      };
      return Api.catalog.getProducts(params);
    },
    getNextPageParam: (lastPage) => {
      // Check cursor returned in metadata
      const nextCursor =
        lastPage?.meta?.nextCursor ??
        lastPage?.pagination?.nextCursor ??
        lastPage?.nextCursor ??
        null;
      if (nextCursor) return nextCursor;

      // Fallback: If 20 items returned, use ID of last item as next cursor
      const items = Array.isArray(lastPage?.items)
        ? lastPage.items
        : Array.isArray(lastPage?.data)
        ? lastPage.data
        : Array.isArray(lastPage)
        ? lastPage
        : [];
      if (items.length === PAGE_SIZE) {
        return items[items.length - 1]?.id || null;
      }
      return undefined;
    },
    initialPageParam: null,
  });

  // Flatten items from all fetched pages
  const rawProducts = useMemo(() => {
    if (!infiniteData?.pages) return [];
    return infiniteData.pages.flatMap((page) => {
      if (Array.isArray(page?.items)) return page.items;
      if (Array.isArray(page?.data)) return page.data;
      if (Array.isArray(page)) return page;
      return [];
    });
  }, [infiniteData]);

  const rawCatList = Array.isArray(categories)
    ? categories
    : Array.isArray(categories?.items)
    ? categories.items
    : Array.isArray(categories?.data)
    ? categories.data
    : [];

  const catList = useMemo(() => {
    return [...rawCatList].sort((a, b) => {
      const orderA = a.sortOrder !== undefined && a.sortOrder !== null ? Number(a.sortOrder) : 0;
      const orderB = b.sortOrder !== undefined && b.sortOrder !== null ? Number(b.sortOrder) : 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [rawCatList]);

  // Find active category details across roots and children
  const activeCategoryObj = useMemo(() => {
    if (!currentCategory) return null;
    for (const cat of catList) {
      if (cat.id === currentCategory || cat.slug === currentCategory) return cat;
      if (Array.isArray(cat.children)) {
        const foundChild = cat.children.find((c) => c.id === currentCategory || c.slug === currentCategory);
        if (foundChild) return foundChild;
      }
    }
    return null;
  }, [catList, currentCategory]);

  const handleClearFilters = () => {
    if (slug) {
      navigate("/products");
    } else {
      setSearchParams({});
    }
    setInStockOnly(false);
  };

  const handleSelectCategory = (catIdOrSlug) => {
    if (slug) {
      navigate(`/products?category=${encodeURIComponent(catIdOrSlug)}`);
    } else {
      searchParams.set("category", catIdOrSlug);
      setSearchParams(searchParams);
    }
  };

  const handleClearCategory = () => {
    if (slug) {
      navigate("/products");
    } else {
      searchParams.delete("category");
      setSearchParams(searchParams);
    }
  };

  const handleClearSearch = () => {
    searchParams.delete("q");
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  const getProductPrice = (p) => {
    return Number(
      p.resolvedPrice?.unitPrice ||
      p.prices?.[0]?.amount ||
      p.countries?.[0]?.price ||
      p.variants?.[0]?.countries?.[0]?.price ||
      p.pricing?.[country.code]?.retailPrice ||
      p.pricing?.IN?.retailPrice ||
      p.price ||
      0
    );
  };

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    // In Stock filter
    if (inStockOnly) {
      list = list.filter((p) => {
        const stock = p.stock ?? p.countries?.[0]?.stock ?? 10;
        return stock > 0;
      });
    }

    // Sort options
    if (sortBy === "price-asc") {
      return list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    }
    if (sortBy === "price-desc") {
      return list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }
    if (sortBy === "rating") {
      return list.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    }
    return list;
  }, [rawProducts, inStockOnly, sortBy, country.code]);

  const pageHeaderTitle = currentSearch
    ? `Search: "${currentSearch}"`
    : activeCategoryObj
    ? activeCategoryObj.name
    : "All Products";

  const pageTitle = currentSearch
    ? `Search results for "${currentSearch}" | Vanom`
    : activeCategoryObj
    ? `${activeCategoryObj.name} Products | Vanom Store`
    : "Explore Products & Combos | Vanom Store";

  const pageDesc =
    activeCategoryObj?.description ||
    `Browse ${filteredProducts.length} certified organic products, value combo packs, and wholesale groceries on Vanom.`;

  return (
    <div className="bg-[#E8EDE9] min-h-screen py-6 sm:py-8">
      <SEO
        title={pageTitle}
        description={pageDesc}
        keywords="organic products, value combos, spices, groceries, wholesale ecommerce"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Filter & Sort Bar */}
        <ProductsHeaderBar
          title={pageHeaderTitle}
          itemCount={filteredProducts.length}
          country={country}
          currentCategory={currentCategory}
          activeCategoryName={activeCategoryObj?.name}
          currentSearch={currentSearch}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          sortBy={sortBy}
          setSortBy={setSortBy}
          gridCols={gridCols}
          setGridCols={setGridCols}
          onClearCategory={handleClearCategory}
          onClearSearch={handleClearSearch}
          onClearAll={handleClearFilters}
        />

        {/* Horizontal Category Scroll Bar for Mobile */}
        <MobileCategoryTabs
          categories={catList}
          currentCategory={currentCategory}
          totalProductsCount={totalCatalogCount || rawProducts.length}
          onSelectCategory={handleSelectCategory}
          onClearCategory={handleClearCategory}
        />

        {/* 2-Column Catalog Body: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ProductsSidebar
            categories={catList}
            currentCategory={currentCategory}
            totalProductsCount={totalCatalogCount || rawProducts.length}
            onSelectCategory={handleSelectCategory}
            onClearCategory={handleClearCategory}
          />

          <div className="lg:col-span-9 space-y-6">
            <ProductsGrid
              products={filteredProducts}
              isLoading={isLoading}
              gridCols={gridCols}
              onClearFilters={handleClearFilters}
            />

            {/* ── Manual Load More Button Section ── */}
            {filteredProducts.length > 0 && (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                {hasNextPage ? (
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-[#00875A] hover:bg-[#00744D] text-white transition-all text-xs sm:text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer active:scale-98"
                    aria-label="Load more products"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Loading more products...</span>
                      </>
                    ) : (
                      <span>Load More Products</span>
                    )}
                  </button>
                ) : (
                  <p className="text-xs font-semibold text-gray-500 select-none bg-white/70 px-4 py-2 rounded-xl border border-gray-200">
                    Showing all {filteredProducts.length} products
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
