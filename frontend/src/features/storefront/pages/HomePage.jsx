/**
 * HomePage.jsx — Enterprise Vanom Storefront Home Page
 *
 * Architecture: Separation of Concerns
 * Each section is a self-contained, reusable component:
 *
 * ┌─────────────────────────────────────────┐
 * │  HeroBanner            (marketing)      │
 * │  CategoryIconStrip     (navigation)     │
 * │  PromoBannerGrid       (marketing)      │
 * │  FeaturedProductsSection (catalog)      │
 * │  ShopByCategoryGrid    (navigation)     │
 * │  SustainabilityBanner  (brand)          │
 * │  BrandBadgeStrip       (brand)          │
 * │  WhyVanomSection       (trust)          │
 * │  TestimonialsSection   (social proof)   │
 * │  NewsletterAppBanner   (growth)         │
 * └─────────────────────────────────────────┘
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";

// ── Home Section Components (Separation of Concerns) ──────────────
import { HeroBanner } from "../components/home/HeroBanner.jsx";
import { CategoryIconStrip } from "../components/home/CategoryIconStrip.jsx";
import { PromoBannerGrid } from "../components/home/PromoBannerGrid.jsx";
import { FeaturedProductsSection } from "../components/home/FeaturedProductsSection.jsx";
import { NewLaunchesSection } from "../components/home/NewLaunchesSection.jsx";
import { UserVideoReelsSection } from "../components/home/UserVideoReelsSection.jsx";
import { ShopByCategoryGrid } from "../components/home/ShopByCategoryGrid.jsx";
import { ComboProductsSection } from "../components/home/ComboProductsSection.jsx";
import { SustainabilityBanner } from "../components/home/SustainabilityBanner.jsx";
import { WhyVanomSection } from "../components/home/WhyVanomSection.jsx";
import { TestimonialsSection } from "../components/home/TestimonialsSection.jsx";
import { NewsletterAppBanner } from "../components/home/NewsletterAppBanner.jsx";

export function HomePage() {
  const { country } = useCountryStore();

  // ── Data Fetching (parallel, non-blocking) ──────────────────────
  const { data: heroBanners = [] } = useQuery({
    queryKey: ["banners-hero"],
    queryFn: () => Api.banners.list({ type: "HERO_CAROUSEL" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: promoBanners = [] } = useQuery({
    queryKey: ["banners-promo"],
    queryFn: () => Api.banners.list({ type: "PROMOTIONAL" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["home-products", country.code],
    queryFn: () => Api.catalog.getProducts(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: featuredData } = useQuery({
    queryKey: ["featured-products", country.code],
    queryFn: () => Api.catalog.getFeaturedProducts(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: bestSellersData } = useQuery({
    queryKey: ["best-seller-products", country.code],
    queryFn: () => Api.catalog.getBestSellers(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => Api.catalog.getCategories(),
    staleTime: 10 * 60 * 1000,
  });

  // ── Data Normalization ──────────────────────────────────────────
  const products = productsData?.items || (Array.isArray(productsData) ? productsData : []);
  const featuredProducts = featuredData?.items || (Array.isArray(featuredData) ? featuredData : []);
  const bestSellers = bestSellersData?.items || (Array.isArray(bestSellersData) ? bestSellersData : []);
  const categoryList = Array.isArray(categories) ? categories : (categories?.items || []);

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col">
      {/* ── 1. Hero Banner Slider (Primary promotional marketing) ── */}
      <section className="bg-transparent">
        <HeroBanner banners={heroBanners} />
      </section>

      {/* ── 2. Quick Category Pills Strip (Soft Warm Cream / Vanilla BG) ── */}
      <section className="bg-[#D5EBD5] border-y border-[#ebdcb0]/50 py-3.5">
        <CategoryIconStrip className="bg-transparent" categories={categoryList} />
      </section>

      {/* ── 3. Featured & Best Seller Products (Candy White Clean BG) ── */}
      <section className="bg-[#D5EBD5] border-b border-gray-100/90 py-4">
        <FeaturedProductsSection
          className="bg-transparent"
          products={products}
          featuredProducts={featuredProducts}
          bestSellers={bestSellers}
          isLoading={loadingProducts}
        />
      </section>

      {/* ── 4. Promo Banner 3-Grid (Candy White BG) ── */}
      <section className="py-8 bg-[#FAF9F6] border-b border-gray-200/60">
        <PromoBannerGrid banners={promoBanners} />
      </section>

      {/* ── 5. New Launches Carousel (Soft Warm Ivory BG) ── */}
      <section className="bg-[#EEF9F5] border-b border-[#F0E6D2]">
        <NewLaunchesSection className="bg-transparent" products={featuredProducts} />
      </section>

      {/* ── 6. Shop by Category Visual Grid (Pure White BG) ── */}
      <section className="bg-[#FAF9F6] border-b border-gray-100">
        <ShopByCategoryGrid className="bg-transparent" categories={categoryList} />
      </section>

      {/* ── 7. Super Saver Combo Bundles (Light Purple BG) ── */}
      <section className="bg-[#F6F2FF] border-b border-[#E9DEFF]">
        <ComboProductsSection className="bg-transparent" />
      </section>

      {/* ── 8. Real User Video Reels (Soft Sage/Earthy Light Tint BG) ── */}
      <section className="bg-[#F7EEDF] border-b border-[#D8EDE2]">
        <UserVideoReelsSection />
      </section>

      {/* ── 8. Sustainability & Brand Story Banner ── */}
      <section className="bg-transparent">
        <SustainabilityBanner />
      </section>

      {/* ── 9. Why Choose Vanom (Soft Warm Neutral BG) ── */}
      <section className="bg-[#EBFDEC] border-b border-gray-200/70">
        <WhyVanomSection className="bg-transparent border-t-0" />
      </section>

      {/* ── 10. Customer Testimonials & Reviews (Soft Honey Gold Light Tint BG) ── */}
      <section className="bg-[#FFFDF5] border-b border-[#F5EACB]">
        <TestimonialsSection className="bg-transparent border-t-0" />
      </section>

      {/* ── 11. Newsletter & Mobile App Download (Pure White Clean BG) ── */}
      <section className="bg-[#F0F5D6]">
        <NewsletterAppBanner />
      </section>
    </div>
  );
}

export default HomePage;
