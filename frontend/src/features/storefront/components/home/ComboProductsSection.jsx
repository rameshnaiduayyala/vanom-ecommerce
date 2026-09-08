import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Layers, BadgePercent } from "lucide-react";
import { ComboProductCard } from "./ComboProductCard.jsx";
import { ROUTES } from "../../../../constants/routes.js";

const DEFAULT_COMBOS = [
  {
    id: "combo-breakfast-organic",
    name: "Organic Breakfast & Superfood Duo",
    slug: "combo-breakfast-organic",
    category: "Groceries & Pantry",
    price: 899,
    mrp: 1348,
    discount: 33,
    rating: 4.94,
    reviewsCount: 1840,
    badge: "BEST VALUE",
    subtitle: "Pure raw forest honey paired with premium California crunchy almonds",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    itemsIncluded: [
      "Pure Raw Organic Forest Honey (500g Glass Jar)",
      "California Whole Raw Almonds (500g Pouch)",
    ],
  },
  {
    id: "combo-kitchen-pantry",
    name: "Mediterranean Kitchen Pantry Pack",
    slug: "combo-kitchen-pantry",
    category: "Organic Grocery",
    price: 1399,
    mrp: 2149,
    discount: 35,
    rating: 4.88,
    reviewsCount: 2190,
    badge: "TOP SELLER",
    subtitle: "First cold-pressed extra virgin olive oil, 2-year aged rice & rock salt",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    itemsIncluded: [
      "Cold Pressed Extra Virgin Olive Oil (1 Litre Bottle)",
      "Royal Heritage Aged Basmati Rice (5 KG Sack)",
      "Pure Organic Himalayan Pink Salt (1 KG)",
    ],
  },
  {
    id: "combo-superfood-energy",
    name: "Morning Energy Superfood Trio",
    slug: "combo-superfood-energy",
    category: "Superfoods & Pantry",
    price: 1199,
    mrp: 1948,
    discount: 38,
    rating: 4.95,
    reviewsCount: 940,
    badge: "ORGANIC PACK",
    subtitle: "Sustained focus, rich antioxidants & protein crunch",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80",
    itemsIncluded: [
      "Ceremonial Grade Matcha Green Tea (100g Tin)",
      "California Whole Raw Almonds (500g)",
      "Organic Raw Chia Seeds (400g)",
    ],
  },
  {
    id: "combo-dryfruits-nuts",
    name: "Royal Dry Fruits & Nuts Connoisseur Box",
    slug: "combo-dryfruits-nuts",
    category: "Dry Fruits & Nuts",
    price: 1499,
    mrp: 2299,
    discount: 35,
    rating: 4.91,
    reviewsCount: 1620,
    badge: "PREMIUM BOX",
    subtitle: "Hand-picked jumbo cashews, organic walnuts & sun-dried figs",
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80",
    itemsIncluded: [
      "Premium Jumbo Roasted Cashews (500g)",
      "Kashmiri Mammoth Walnut Kernels (500g)",
      "Organic Sun-Dried Figs (500g)",
    ],
  },
];

export function ComboProductsSection({
  combos = DEFAULT_COMBOS,
  className = "",
}) {
  const list = Array.isArray(combos) && combos.length > 0 ? combos : DEFAULT_COMBOS;

  return (
    <section className={`py-10 sm:py-14 w-full max-w-full overflow-hidden ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 w-full min-w-0">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#7C3AED]/15 text-[#5B21B6] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2 border border-[#7C3AED]/25 shadow-2xs">
              <BadgePercent className="w-3.5 h-3.5 text-[#7C3AED]" />
              Super Saver Bundles
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Curated Combos & Value Packs
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              Hand-picked pantry & superfood pairings designed for daily healthy living and up to 40% bundle savings.
            </p>
          </div>

          <Link
            to={`${ROUTES.PRODUCTS}?category=combos`}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#7C3AED] hover:text-[#5B21B6] transition-colors whitespace-nowrap shrink-0 group"
          >
            <span>View All Combos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Combos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {list.map((combo) => (
            <ComboProductCard key={combo.id} combo={combo} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComboProductsSection;
