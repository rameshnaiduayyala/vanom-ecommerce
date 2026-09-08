import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { ROUTES } from "../../../../constants/routes.js";

const REFERENCE_PRODUCTS = [
  {
    id: "organic-ceremonial-matcha-tea",
    name: "Ceremonial Grade Matcha Green Tea 100g",
    subtitle: "Kyoto First Harvest | Antioxidant Rich",
    price: 799,
    mrp: 1199,
    discount: 33,
    rating: 4.94,
    reviewsCount: 840,
    badge: "New",
    bgGradient: "from-[#EDF6ED] via-[#DFEEDF] to-[#CEE4CE]",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "organic-raw-chia-seeds",
    name: "Organic Raw Black Chia Seeds 400g",
    subtitle: "Omega-3 Rich | Dietary Fiber Superfood",
    price: 299,
    mrp: 450,
    discount: 33,
    rating: 4.81,
    reviewsCount: 1620,
    badge: "Bestseller",
    bgGradient: "from-[#F3F4F6] via-[#E5E7EB] to-[#D1D5DB]",
    image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "organic-extra-virgin-olive-oil",
    name: "Cold Pressed Extra Virgin Olive Oil 1L",
    subtitle: "100% First Cold Pressed | USDA Organic",
    price: 899,
    mrp: 1299,
    discount: 30,
    rating: 4.88,
    reviewsCount: 2410,
    badge: "Bestseller",
    bgGradient: "from-[#F4F8F0] via-[#E8F3E0] to-[#DCEDD2]",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "royal-heritage-aged-basmati-rice",
    name: "Royal Heritage Aged Basmati Rice 5kg",
    subtitle: "Aged 2 Years | Extra Long Grains",
    price: 649,
    mrp: 850,
    discount: 24,
    rating: 4.92,
    reviewsCount: 3820,
    badge: "Bestseller",
    bgGradient: "from-[#FAF3DF] via-[#F8ECD1] to-[#F3E2BD]",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "pure-raw-forest-honey",
    name: "Pure Raw Organic Forest Honey 500g",
    subtitle: "Wild Flora | 100% Raw & Unprocessed",
    price: 449,
    mrp: 599,
    discount: 25,
    rating: 4.86,
    reviewsCount: 1540,
    badge: "New",
    bgGradient: "from-[#FFF8E7] via-[#FFF0CF] to-[#FFE6B0]",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "california-raw-almonds",
    name: "California Whole Raw Almonds 500g",
    subtitle: "High Protein | Jumbo Crunch",
    price: 549,
    mrp: 749,
    discount: 26,
    rating: 4.79,
    reviewsCount: 1980,
    badge: "Bestseller",
    bgGradient: "from-[#FBF5EB] via-[#F6ECE0] to-[#EFE1D1]",
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=400&q=80",
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
    <section className={`py-8 sm:py-10 w-full max-w-full overflow-hidden ${className}`}>
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
