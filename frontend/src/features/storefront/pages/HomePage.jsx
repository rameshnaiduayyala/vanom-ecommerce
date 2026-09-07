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

  // 1. Hero Banners
  const { data: heroBanners = [] } = useQuery({
    queryKey: ["banners-hero"],
    queryFn: () => Api.banners.list({ type: "HERO_CAROUSEL" }),
  });

  // 2. Promotional Banners
  const { data: promoBanners = [] } = useQuery({
    queryKey: ["banners-promo"],
    queryFn: () => Api.banners.list({ type: "PROMOTIONAL" }),
  });

  // 3. Products (all)
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["home-products", country.code],
    queryFn: () => Api.catalog.getProducts(),
  });

  // 4. Featured Products
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured-products", country.code],
    queryFn: () => Api.catalog.getFeaturedProducts(),
  });

  // 5. Best Seller Products
  const { data: bestSellersData, isLoading: loadingBestSellers } = useQuery({
    queryKey: ["best-seller-products", country.code],
    queryFn: () => Api.catalog.getBestSellers(),
  });

  // 6. Categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  const products = productsData?.items || (Array.isArray(productsData) ? productsData : []);
  const featuredProducts = featuredData?.items || (Array.isArray(featuredData) ? featuredData : []);
  const bestSellers = bestSellersData?.items || (Array.isArray(bestSellersData) ? bestSellersData : []);

  return (
    <div className="bg-[#E8EDE9]">
      {/* 1. Hero Slider */}
      <HeroSlider products={products} banners={heroBanners} />

      {/* 2. Shop by Category */}
      <section className="py-14 sm:py-20 bg-[#E8EDE9]">
        <CategorySection categories={categories} />
      </section>

      {/* 3. Best Sellers & Trending */}
      <section className="py-14 sm:py-20 bg-[#E8EDE9] border-y border-[#D6DDD8]">
        <TrendingSection
          products={products}
          featuredProducts={featuredProducts}
          bestSellers={bestSellers}
          categories={categories}
          isLoading={loadingProducts || loadingFeatured || loadingBestSellers}
        />
      </section>

      {/* 4. Global Stats & Trust Metrics */}
      <TrustBadgesSection />

      {/* 5. Flash Deals */}
      <section className="py-12 sm:py-16 bg-[#E8EDE9] border-y border-[#D6DDD8]">
        <FlashDealsAdBanner />
      </section>

      {/* 6. Featured Category Banners */}
      <section className="py-14 sm:py-20 bg-[#E8EDE9]">
        <DualPromoBanners banners={promoBanners} />
      </section>
    </div>
  );
}

export default HomePage;
