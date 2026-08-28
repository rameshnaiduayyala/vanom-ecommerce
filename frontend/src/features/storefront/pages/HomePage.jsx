import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
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
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* 1. Hero Multi-Slide Carousel */}
      <HeroSlider />

      {/* 2. Limited-Time Flash Deal Ad Banner with Countdown & Copy Coupon */}
      <FlashDealsAdBanner />

      {/* 3. Enterprise Trust Pillars */}
      <TrustBadgesSection />

      {/* 4. Marketplace Categories Grid */}
      <CategorySection categories={categories} />

      {/* 5. Dual Category Promotion Ads (Packaging & Commercial Kitchen) */}
      <DualPromoBanners />

      {/* 6. Trending Deals & Full Product Catalog Showcase */}
      <TrendingSection
        products={products}
        categories={categories}
        isLoading={loadingProducts}
      />

      {/* 7. Commercial Credit & Freight Sponsor Ad Banner */}
      <SponsorBrandAd />
    </div>
  );
}
