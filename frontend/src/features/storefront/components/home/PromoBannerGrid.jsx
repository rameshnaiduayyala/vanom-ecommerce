import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes.js";
import { ArrowRight } from "lucide-react";

const DEFAULT_BANNERS = [
  {
    id: "deal-1",
    badge: "Top Deals of The Week",
    title: "Upto 50% Off",
    cta: "Shop Deals",
    link: ROUTES.PRODUCTS,
    bg: "linear-gradient(135deg, #003D2B, #006B3C)",
    badgeColor: "#D9A514",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "deal-2",
    badge: "Home Essentials",
    title: "Upgrade your space with our essential collection",
    cta: "Shop Now",
    link: ROUTES.PRODUCTS,
    bg: "linear-gradient(135deg, #1a1a2e, #16213e)",
    badgeColor: "#60a5fa",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "deal-3",
    badge: "Smart Living",
    title: "Latest electronics for the connected life",
    cta: "Explore Now",
    link: ROUTES.PRODUCTS,
    bg: "linear-gradient(135deg, #0f172a, #1e293b)",
    badgeColor: "#34d399",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
  },
];

export function PromoBannerGrid({ banners = [] }) {
  const items = banners.length >= 3
    ? banners.slice(0, 3).map((b, i) => ({
        ...DEFAULT_BANNERS[i],
        ...b,
        image: b.imageUrl || DEFAULT_BANNERS[i].image,
        link: b.buttonLink || DEFAULT_BANNERS[i].link,
        cta: b.buttonText || DEFAULT_BANNERS[i].cta,
      }))
    : DEFAULT_BANNERS;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className="relative rounded-2xl overflow-hidden group flex flex-col justify-end"
            style={{ background: item.bg, minHeight: 180 }}
          >
            {/* Background Image */}
            <img
              src={item.image}
              alt={item.badge}
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity group-hover:scale-105 transform duration-500"
            />
            {/* Content */}
            <div className="relative z-10 p-5">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"
                style={{ backgroundColor: `${item.badgeColor}25`, color: item.badgeColor }}
              >
                {item.badge}
              </span>
              <h3 className="text-white font-black text-lg sm:text-xl leading-tight mb-3">{item.title}</h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-all group-hover:gap-2.5">
                {item.cta} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PromoBannerGrid;
