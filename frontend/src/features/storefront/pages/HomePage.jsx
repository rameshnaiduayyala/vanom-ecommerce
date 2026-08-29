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

// Consistent enterprise section spacing
const SECTION_GAP = "pt-14 sm:pt-20";

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
    <div className="pb-28 bg-slate-50">
      {/* 1. Hero Multi-Slide Carousel — full bleed, no top padding */}
      <HeroSlider products={products} />

      {/* 2. Flash Deal Ad Banner */}
      <div className={SECTION_GAP}>
        <FlashDealsAdBanner />
      </div>

      {/* 3. Enterprise Trust Pillars */}
      <div className={SECTION_GAP}>
        <TrustBadgesSection />
      </div>

      {/* 4. Marketplace Categories Grid */}
      <div className={SECTION_GAP}>
        <CategorySection categories={categories} />
      </div>

      {/* 5. Dual Category Promotion Ads */}
      <div className={SECTION_GAP}>
        <DualPromoBanners />
      </div>

      {/* 6. Trending Deals & Full Product Catalog */}
      <div className={SECTION_GAP}>
        <TrendingSection
          products={products}
          categories={categories}
          isLoading={loadingProducts}
        />
      </div>

      {/* 7. Sponsor / Freight Credit Ad */}
      <div className={SECTION_GAP}>
        <SponsorBrandAd />
      </div>
    </div>
  );
}
