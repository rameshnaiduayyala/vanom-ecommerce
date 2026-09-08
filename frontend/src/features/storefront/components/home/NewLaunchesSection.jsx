import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { ROUTES } from "../../../../constants/routes.js";

const DEFAULT_NEW_LAUNCHES = [
  {
    id: "launch-prod-1",
    name: "Pure Shilajit Gold Resin 20g",
    subtitle: "Authentic Himalayan Grade A+",
    price: 1499,
    mrp: 2499,
    discount: 40,
    rating: 4.9,
    reviewsCount: 1240,
    badge: "New Launch",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "launch-prod-2",
    name: "Sundarbans Wild Raw Honey 500g",
    subtitle: "Unprocessed & Pure Single-Origin",
    price: 699,
    mrp: 999,
    discount: 30,
    rating: 4.8,
    reviewsCount: 890,
    badge: "New Launch",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "launch-prod-3",
    name: "24K Saffron Kumkumadi Facial Oil",
    subtitle: "Kashmiri Mongra Saffron Infusion",
    price: 1899,
    mrp: 2999,
    discount: 36,
    rating: 5.0,
    reviewsCount: 2150,
    badge: "New Launch",
    image: "https://images.unsplash.com/photo-1608248597359-009a25b12a21?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "launch-prod-4",
    name: "Vedic Bilona A2 Desi Cow Ghee 1L",
    subtitle: "Traditional Curd Churned",
    price: 1599,
    mrp: 2199,
    discount: 27,
    rating: 4.9,
    reviewsCount: 3410,
    badge: "New Launch",
    image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "launch-prod-5",
    name: "Organic Ceremonial Matcha Tea 50g",
    subtitle: "First Harvest Japanese Grade",
    price: 1199,
    mrp: 1799,
    discount: 33,
    rating: 4.7,
    reviewsCount: 620,
    badge: "New Launch",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "launch-prod-6",
    name: "Cold Pressed Moroccan Argan Hair Elixir",
    subtitle: "Deep Moisture & Anti-Frizz",
    price: 899,
    mrp: 1399,
    discount: 35,
    rating: 4.8,
    reviewsCount: 1740,
    badge: "New Launch",
    image: "https://images.unsplash.com/photo-1608248597359-009a25b12a21?auto=format&fit=crop&w=400&q=80",
  },
];

export function NewLaunchesSection({ products = [], className = "" }) {
  const scrollRef = useRef(null);

  const list = products.length > 0 ? products : DEFAULT_NEW_LAUNCHES;

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className={`py-8 sm:py-10 px-4 sm:px-8 lg:px-12 select-none w-full max-w-full overflow-hidden ${className}`}>
      <div className="max-w-[1440px] mx-auto w-full min-w-0">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#204B38] tracking-tight">
              New Launches
            </h2>
            <p className="text-xs text-[#345547] mt-0.5">
              Discover the latest conscious formulations and handcrafted additions.
            </p>
          </div>

          {/* Controls & View All */}
          <div className="flex items-center gap-3">
            <Link
              to={`${ROUTES.PRODUCTS}?filter=new`}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#358B5B] hover:text-[#204B38] hover:underline transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll(-1)}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcb0] hover:bg-[#358B5B] hover:text-white text-gray-700 shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll(1)}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcb0] hover:bg-[#358B5B] hover:text-white text-gray-700 shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Row */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-3 pt-1 px-1 w-full min-w-0 touch-pan-x"
        >
          {list.map((prod) => (
            <div key={prod.id} className="w-[180px] sm:w-[220px] shrink-0">
              <ProductCardCompact product={prod} badge="New Launch" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewLaunchesSection;
