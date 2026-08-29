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

// BestBuy-style widescreen section card (1440px wide) with rounded corners
function SectionCard({ children, className = "" }) {
  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
      <div className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs py-7 px-4 sm:px-8 ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function HomePage() {
  const { country } = useCountryStore();

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["home-products", country.code],
    queryFn: () => Api.catalog.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  const products = productsData?.items || [];

  return (
    // ── Gray page background with widescreen rounded section cards ──
    <div className="bg-[#ededed] space-y-4 sm:space-y-6 pb-12 pt-3 sm:pt-4">

      {/* 1. Hero — 1440px smart widescreen banner */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-slate-200/80">
          <HeroSlider products={products} />
        </div>
      </div>

      {/* 2. Trust Pillars */}
      <SectionCard>
        <TrustBadgesSection />
      </SectionCard>

      {/* 3. Flash Deal Banner */}
      <SectionCard>
        <FlashDealsAdBanner />
      </SectionCard>

      {/* 4. Shop by Category */}
      <SectionCard>
        <CategorySection categories={categories} />
      </SectionCard>

      {/* 5. Trending Now */}
      <SectionCard>
        <TrendingSection
          products={products}
          categories={categories}
          isLoading={loadingProducts}
        />
      </SectionCard>

      {/* 6. Featured Deals */}
      <SectionCard>
        <DualPromoBanners />
      </SectionCard>

      {/* 7. Sponsor / B2B Credit CTA */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
          <SponsorBrandAd />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
