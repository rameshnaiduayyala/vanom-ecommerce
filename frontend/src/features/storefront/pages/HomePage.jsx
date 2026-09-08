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
    <div className="min-h-screen bg-[#FFF7DD]">
      {/* ── 1. Hero Banner Slider (Primary promotional marketing) ── */}
      <HeroBanner banners={heroBanners} />

      {/* ── 2. Quick Category Pills Strip (High-intent instant browsing) ── */}
      <CategoryIconStrip className="bg-white/60" categories={categoryList} />

      {/* ── 3. Featured & Best Seller Products (Immediate product conversion) ── */}
      <FeaturedProductsSection
        products={products}
        featuredProducts={featuredProducts}
        bestSellers={bestSellers}
        isLoading={loadingProducts}
      />

      {/* ── 4. Promo Banner 3-Grid (Mid-page visual campaign breaks) ── */}
      <section className="py-6 bg-white/60">
        <PromoBannerGrid banners={promoBanners} />
      </section>

      {/* ── 5. New Launches Carousel (Fresh arrival discovery) ── */}
      <NewLaunchesSection className="bg-white/60" products={featuredProducts} />

      {/* ── 6. Shop by Category Visual Grid (Deep category exploration) ── */}
      <ShopByCategoryGrid categories={categoryList} />

      {/* ── 7. Real User Video Reels (Social proof & UGC shopping experience) ── */}
      <UserVideoReelsSection />

      {/* ── 8. Sustainability & Brand Story Banner ── */}
      <SustainabilityBanner />

      {/* ── 9. Why Choose Vanom (Core value propositions & trust building) ── */}
      <WhyVanomSection />

      {/* ── 10. Customer Testimonials & Reviews ── */}
      <TestimonialsSection />

      {/* ── 11. Newsletter & Mobile App Download (Retention & growth) ── */}
      <NewsletterAppBanner />
    </div>
  );
}

export default HomePage;
