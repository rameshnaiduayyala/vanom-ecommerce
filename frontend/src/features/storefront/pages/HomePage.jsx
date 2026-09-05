import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { HeroSlider } from "../components/HeroSlider.jsx";
import { CommercialProcurementSection } from "../components/CommercialProcurementSection.jsx";
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
    <div className="bg-white">
      {/* 1. Hero Slider */}
      <HeroSlider products={products} />

      {/* 2. Shop by Category */}
      <section className="py-14 sm:py-20 bg-white">
        <CategorySection categories={categories} />
      </section>

      {/* 3. Best Sellers & Trending */}
      <section className="py-14 sm:py-20 bg-[#FAFCFA] border-y border-[#E8EDE9]">
        <TrendingSection
          products={products}
          categories={categories}
          isLoading={loadingProducts}
        />
      </section>

      {/* 4. Trust Pillars */}
      <section className="py-12 sm:py-16 bg-white">
        <TrustBadgesSection />
      </section>

      {/* 5. Flash Deals */}
      <section className="py-12 sm:py-16 bg-[#FAFCFA] border-y border-[#E8EDE9]">
        <FlashDealsAdBanner />
      </section>

      {/* 6. Featured Category Banners */}
      <section className="py-14 sm:py-20 bg-white">
        <DualPromoBanners />
      </section>
    </div>
  );
}
