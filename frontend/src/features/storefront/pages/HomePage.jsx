import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { HeroSlider } from "../components/HeroSlider.jsx";
import { FlashDealsAdBanner } from "../components/FlashDealsAdBanner.jsx";
import { TrustBadgesSection } from "../components/TrustBadgesSection.jsx";
import { CategorySection } from "../components/CategorySection.jsx";
import { DualPromoBanners } from "../components/DualPromoBanners.jsx";
import { TrendingSection } from "../components/TrendingSection.jsx";
import { SponsorBrandAd } from "../components/SponsorBrandAd.jsx";

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
    <div className="pb-24">
      {/* 1. Hero Multi-Slide Carousel */}
      <HeroSlider />

      {/* 2. Flash Deal Ad Banner */}
      <div className="pt-10 sm:pt-14">
        <FlashDealsAdBanner />
      </div>

      {/* 3. Enterprise Trust Pillars */}
      <div className="pt-12 sm:pt-16">
        <TrustBadgesSection />
      </div>

      {/* 4. Marketplace Categories Grid */}
      <div className="pt-12 sm:pt-16">
        <CategorySection categories={categories} />
      </div>

      {/* 5. Dual Category Promotion Ads */}
      <div className="pt-12 sm:pt-16">
        <DualPromoBanners />
      </div>

      {/* 6. Trending Deals & Full Product Catalog */}
      <div className="pt-12 sm:pt-16">
        <TrendingSection
          products={products}
          categories={categories}
          isLoading={loadingProducts}
        />
      </div>

      {/* 7. Sponsor / Freight Credit Ad */}
      <div className="pt-12 sm:pt-16">
        <SponsorBrandAd />
      </div>
    </div>
  );
}
