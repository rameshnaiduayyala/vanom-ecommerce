import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { ROUTES } from "../../../../constants/routes.js";

const FILTER_TABS = [
  { key: "ALL", label: "All" },
  { key: "BEST_SELLERS", label: "Best Sellers" },
  { key: "NEW", label: "New Arrivals" },
  { key: "TOP_RATED", label: "Top Rated" },
  { key: "OFFERS", label: "Offers" },
];

const REFERENCE_PRODUCTS = [
  {
    id: "prod-1",
    name: "Philips Air Fryer 4.1L",
    subtitle: "Healthy Cooking",
    price: 3499,
    mrp: 5299,
    discount: 42,
    rating: 4.8,
    reviewsCount: 2340,
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "prod-2",
    name: "Lenovo IdeaPad Slim 3",
    subtitle: "Intel i5, 16GB, 512GB SSD",
    price: 42990,
    mrp: 56990,
    discount: 25,
    rating: 4.6,
    reviewsCount: 12154,
    badge: "New",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "prod-3",
    name: "Prestige Mixer Grinder 750W",
    subtitle: "Powerful & Durable",
    price: 2299,
    mrp: 3429,
    discount: 34,
    rating: 4.7,
    reviewsCount: 9764,
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "prod-4",
    name: "Noise Buds VS104",
    subtitle: "Crystal Clear Sound",
    price: 1499,
    mrp: 2999,
    discount: 50,
    rating: 4.4,
    reviewsCount: 8493,
    badge: null,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "prod-5",
    name: "Live Indoor Plant",
    subtitle: "Purifies Air",
    price: 499,
    mrp: 799,
    discount: 38,
    rating: 4.9,
    reviewsCount: 2873,
    badge: null,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "prod-6",
    name: "boAt Smartwatch",
    subtitle: "Track Your Fitness",
    price: 4999,
    mrp: 7999,
    discount: 38,
    rating: 4.5,
    reviewsCount: 4170,
    badge: null,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
  },
];

export function FeaturedProductsSection({
  products = [],
  featuredProducts = [],
  bestSellers = [],
  isLoading = false,
  className = "",
}) {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const rawList = products.length > 0 ? products : (featuredProducts.length > 0 ? featuredProducts : REFERENCE_PRODUCTS);
  const productList = Array.isArray(rawList) ? rawList : (rawList?.items || REFERENCE_PRODUCTS);
  const featuredList = Array.isArray(featuredProducts) && featuredProducts.length > 0 ? featuredProducts : productList;
  const bestSellerList = Array.isArray(bestSellers) && bestSellers.length > 0 ? bestSellers : productList;

  const displayed = React.useMemo(() => {
    let list = productList;
    if (activeFilter === "BEST_SELLERS") list = bestSellerList;
    else if (activeFilter === "NEW") list = productList.filter((p) => p.badge === "New" || !p.isBestSeller);
    else if (activeFilter === "TOP_RATED") list = [...productList].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (activeFilter === "OFFERS") list = productList.filter((p) => (p.discount || 0) >= 30);
    else list = featuredList;
    return (list.length > 0 ? list : REFERENCE_PRODUCTS).slice(0, 12);
  }, [activeFilter, productList, featuredList, bestSellerList]);

  return (
    <section className={`py-8 sm:py-10 bg-white/60 w-full max-w-full overflow-hidden ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 w-full min-w-0">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Featured Products</h2>
            <Link
              to={ROUTES.PRODUCTS}
              className="md:hidden flex items-center gap-1 text-xs font-bold text-[#358B5B] hover:text-[#204B38] transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
            {/* Filter Tabs - Horizontal scrollable on small screens */}
            <div className="flex items-center gap-1.5 bg-gray-100/90 p-1 rounded-xl overflow-x-auto scrollbar-none w-full md:w-auto min-w-0 touch-pan-x">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeFilter === tab.key
                      ? "bg-[#358B5B] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              to={ROUTES.PRODUCTS}
              className="hidden md:flex items-center gap-1 text-xs font-bold text-[#358B5B] hover:text-[#204B38] transition-colors whitespace-nowrap shrink-0"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {displayed.map((p, i) => (
              <ProductCardCompact
                key={p.id || i}
                product={p}
                badge={p.badge || (i === 0 ? "Bestseller" : i === 1 ? "New" : null)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProductsSection;
