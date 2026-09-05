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
    <div className="pb-24 space-y-0">
      {/* 1. Hero Multi-Slide Carousel */}
      <HeroSlider products={products} />

      {/* 2. Shop by Category (Elevated strip directly below hero) */}
      <section className="py-12 sm:py-16 bg-white border-b border-[#E3ECE6]/80">
        <CategorySection categories={categories} />
      </section>

      {/* 3. Best Sellers & Trending Products */}
      <section className="py-12 sm:py-16">
        <TrendingSection
          products={products}
          categories={categories}
          isLoading={loadingProducts}
        />
      </section>

      {/* 4. Trust Pillars & Delivery Assurances */}
      <section className="py-10 sm:py-14 bg-white border-y border-[#E3ECE6]/80">
        <TrustBadgesSection />
      </section>

      {/* 5. Flash Deals Special Discount */}
      <section className="py-10 sm:py-14">
        <FlashDealsAdBanner />
      </section>

      {/* 6. Featured Category Promotion Banners */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#E3ECE6]/80">
        <DualPromoBanners />
      </section>
    </div>
  );
}
