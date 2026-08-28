import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { HeroSlider } from "../components/HeroSlider.jsx";
import { TrustBadgesSection } from "../components/TrustBadgesSection.jsx";
import { CategorySection } from "../components/CategorySection.jsx";
import { TrendingSection } from "../components/TrendingSection.jsx";

export function HomePage() {
  const { country } = useCountryStore();

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["home-products", country.code],
    queryFn: () => Api.catalog.getProducts(),
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  const products = productsData?.items || [];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* 1. Hero Carousel Slider */}
      <HeroSlider />

      {/* 2. Enterprise Assurances & Trust Pillars */}
      <TrustBadgesSection />

      {/* 3. Marketplace Categories Grid */}
      <CategorySection categories={categories} />

      {/* 4. Trending Deals & Full Product Catalog Showcase */}
      <TrendingSection
        products={products}
        categories={categories}
        isLoading={loadingProducts}
      />
    </div>
  );
}
