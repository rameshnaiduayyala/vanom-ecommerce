import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const DEFAULT_CATEGORIES = [
  { id: "groceries", name: "Groceries", subtext: "Fresh Produce, Pantry & Staples", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80" },
  { id: "electronics", name: "Electronics", subtext: "Mobiles, Laptops, Audio & More", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80" },
  { id: "home-living", name: "Home & Living", subtext: "Make your home beautiful", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80" },
  { id: "kitchen-dining", name: "Kitchen & Dining", subtext: "Cook, Serve, Enjoy", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80" },
  { id: "beauty-care", name: "Beauty & Personal Care", subtext: "Care for a better you", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80" },
  { id: "toys-baby", name: "Toys & Baby", subtext: "Happy childhood moments", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80" },
  { id: "sports-fitness", name: "Sports & Fitness", subtext: "Stronger every day", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80" },
  { id: "stationery-office", name: "Stationery & Office", subtext: "Productivity starts here", image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=400&q=80" },
  { id: "pet-care", name: "Pet Care", subtext: "For your furry friends", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80" },
];

export function ShopByCategoryGrid({ categories = [], className = "" }) {
  const items = categories.length > 0
    ? categories.map((c, i) => ({
      ...DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length],
      id: c.id || `cat-${i}`,
      name: c.name || DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].name,
      image: c.imageUrl || DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].image,
    }))
    : DEFAULT_CATEGORIES;

  return (
    <section className={`py-10 bg-white/60 ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-bold text-[#006B3C] hover:text-[#003D2B] transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Grid: 5 columns on desktop, 2 rows matching reference */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="group bg-white rounded-2xl border border-gray-100 hover:border-[#006B3C]/30 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Text Info Below Image */}
              <div className="p-3.5 flex flex-col gap-0.5">
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#006B3C] transition-colors leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-gray-500 leading-snug truncate">
                  {cat.subtext}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShopByCategoryGrid;

