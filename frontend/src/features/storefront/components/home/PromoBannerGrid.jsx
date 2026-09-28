import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { ROUTES } from "../../../../constants/routes.js";
import { ArrowRight } from "lucide-react";

const DEFAULT_BANNERS = [
  {
    id: "deal-1",
    badge: "Top Deals",
    badgeSub: "Of The Week",
    title: "Upto 50% Off",
    cta: "Shop Deals",
    link: ROUTES.PRODUCTS,
    bg: "bg-[#AEDBE4]",
    badgeColor: "#1a3c2e",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
    dark: false,
  },
  {
    id: "deal-2",
    badge: "Home",
    badgeSub: "Essentials",
    title: "Upgrade your space with curated products.",
    cta: "Shop Now",
    link: ROUTES.PRODUCTS,
    bg: "bg-[#f5ede4]",
    badgeColor: "#1a3c2e",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
    dark: false,
  },
  {
    id: "deal-3",
    badge: "Smart",
    badgeSub: "Living",
    title: "Latest electronics for a connected life.",
    cta: "Explore Now",
    link: ROUTES.PRODUCTS,
    bg: "bg-[#e8edf2]",
    badgeColor: "#1a3c2e",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
    dark: false,
  },
];

export function PromoBannerGrid({ banners = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const items =
    banners.length >= 3
      ? banners.slice(0, 3).map((b, i) => ({
        ...DEFAULT_BANNERS[i],
        ...b,
        image: b.imageUrl || DEFAULT_BANNERS[i].image,
        link: b.buttonLink || DEFAULT_BANNERS[i].link,
        cta: b.buttonText || DEFAULT_BANNERS[i].cta,
      }))
      : DEFAULT_BANNERS;

  return (
    <div ref={sectionRef} className="w-full overflow-hidden">
      <Marquee
        speed={40}
        pauseOnHover={true}
        gradient={false}
        loop={0}
      >
        {[...items, ...items, ...items, ...items, ...items, ...items].map((item, idx) => (
          <BannerCard key={`${item.id}-${idx}`} item={item} isVisible={isVisible} />
        ))}
      </Marquee>
    </div>
  );
}

function BannerCard({ item, isVisible }) {
  return (
    <div
      style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.5s ease" }}
      className={`relative rounded-2xl overflow-hidden p-6
        min-h-[200px] sm:min-h-[220px]
        w-[82vw] sm:w-[360px] lg:w-[400px]
        mx-2 shrink-0 flex flex-col justify-between
        ${item.bg} border border-white/60 shadow-sm group cursor-pointer`}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.025] transition-colors duration-300 pointer-events-none rounded-2xl" />

      {/* Right floating image */}
      <img
        src={item.image}
        alt={item.title}
        draggable={false}
        className="absolute right-0 bottom-0 w-[45%] h-[88%] object-cover object-center
          group-hover:scale-[1.06] transition-transform duration-700 ease-out
          pointer-events-none rounded-tl-2xl select-none"
        style={{
          maskImage: "linear-gradient(to left, black 65%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, black 65%, transparent 100%)",
        }}
      />

      {/* Left text */}
      <div className="relative z-10 max-w-[58%]">
        <h3 className={`text-xl font-black leading-[1.15] tracking-tight ${item.dark ? "text-white" : "text-gray-900"}`}>
          {item.badge}
          <br />
          <span className={item.dark ? "text-emerald-100" : "text-gray-700"}>
            {item.badgeSub}
          </span>
        </h3>
        <p className={`text-xs mt-2 leading-snug font-medium ${item.dark ? "text-yellow-200 font-bold" : "text-gray-600"}`}>
          {item.title}
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-4">
        <Link
          to={item.link}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 bg-[#F9BC15] hover:bg-[#e6ab0f]
            text-[#003D2B] text-[11px] font-bold px-4 py-2 rounded-full shadow-xs
            hover:shadow-sm transition-all duration-200 active:scale-95 group/btn"
        >
          <span>{item.cta}</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1.5 transition-transform duration-300 ease-out" />
        </Link>
      </div>
    </div>
  );
}

export default PromoBannerGrid;

