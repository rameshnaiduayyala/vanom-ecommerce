import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { SEO } from "../../../components/common/SEO.jsx";
import { ProductsHeaderBar } from "../components/products/ProductsHeaderBar.jsx";
import { ProductsSidebar } from "../components/products/ProductsSidebar.jsx";
import { MobileCategoryTabs } from "../components/products/MobileCategoryTabs.jsx";
import { ProductsGrid } from "../components/products/ProductsGrid.jsx";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { country } = useCountryStore();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("q") || "";
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

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products-list", currentCategory, currentSearch, country.code],
    queryFn: () =>
      Api.catalog.getProducts({
        ...(currentCategory ? { categoryId: currentCategory } : {}),
        ...(currentSearch ? { search: currentSearch } : {}),
      }),
  });

  const catList = Array.isArray(categories)
    ? categories
    : Array.isArray(categories?.items)
    ? categories.items
    : Array.isArray(categories?.data)
    ? categories.data
    : [];

  const rawProducts = Array.isArray(productsData?.items)
    ? productsData.items
    : Array.isArray(productsData?.data)
    ? productsData.data
    : Array.isArray(productsData)
    ? productsData
    : [];

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
    setSearchParams({});
    setInStockOnly(false);
  };

  const handleSelectCategory = (catId) => {
    searchParams.set("category", catId);
    setSearchParams(searchParams);
  };

  const handleClearCategory = () => {
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  const handleClearSearch = () => {
    searchParams.delete("q");
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
          totalProductsCount={rawProducts.length}
          onSelectCategory={handleSelectCategory}
          onClearCategory={handleClearCategory}
        />

        {/* 2-Column Catalog Body: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ProductsSidebar
            categories={catList}
            currentCategory={currentCategory}
            totalProductsCount={rawProducts.length}
            onSelectCategory={handleSelectCategory}
            onClearCategory={handleClearCategory}
          />

          <div className="lg:col-span-9">
            <ProductsGrid
              products={filteredProducts}
              isLoading={isLoading}
              gridCols={gridCols}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
