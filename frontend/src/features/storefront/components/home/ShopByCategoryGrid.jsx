import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_CATEGORIES = [
  { id: "cat-electronics", name: "Electronics", subtext: "Mobiles, Laptops, Audio & More", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80", bg: "#1E3A8A" },
  { id: "cat-home", name: "Home & Living", subtext: "Make your home beautiful", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80", bg: "#92400E" },
  { id: "cat-kitchen", name: "Kitchen & Dining", subtext: "Cook, Brew, Enjoy", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=300&q=80", bg: "#9F1239" },
  { id: "cat-beauty", name: "Beauty & Personal Care", subtext: "Care for a better you", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80", bg: "#7C3AED" },
  { id: "cat-health", name: "Health & Wellness", subtext: "A healthier, happier you", image: "https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=300&q=80", bg: "#0369A1" },
  { id: "cat-toys", name: "Toys & Baby", subtext: "Happy childhood memories", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=80", bg: "#EA580C" },
  { id: "cat-sports", name: "Sports & Fitness", subtext: "Stronger every day", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80", bg: "#15803D" },
  { id: "cat-stationery", name: "Stationery & Office", subtext: "Productivity starts here", image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=300&q=80", bg: "#B45309" },
  { id: "cat-pets", name: "Pet Care", subtext: "For your furry friends", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80", bg: "#6D28D9" },
  { id: "cat-auto", name: "Automotive", subtext: "Drive with confidence", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80", bg: "#0F172A" },
];

export function ShopByCategoryGrid({ categories = [] }) {
  const scrollRef = useRef(null);
  const items = categories.length > 0
    ? categories.map((c, i) => ({
        ...DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length],
        id: c.id || `cat-${i}`,
        name: c.name || DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].name,
        image: c.imageUrl || DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].image,
      }))
    : DEFAULT_CATEGORIES;

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section className="py-10 bg-[#f8f9fa]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Shop by Category</h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-bold text-[#006B3C] hover:text-[#003D2B] transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {items.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] flex items-end cursor-pointer"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, ${cat.bg}DD 0%, ${cat.bg}55 60%, transparent 100%)` }}
                />
                <div className="relative z-10 p-3">
                  <h3 className="text-white font-bold text-sm leading-tight">{cat.name}</h3>
                  <p className="text-white/70 text-[10px]">{cat.subtext}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopByCategoryGrid;
