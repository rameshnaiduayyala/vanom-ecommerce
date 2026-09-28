import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
    // Respect prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

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
    <div ref={sectionRef} className="max-w-[1440px] mx-auto px-4 sm:px-8">
      {/* 
        Responsive layout:
        - Mobile: native horizontal swipeable scroll with snap-x mandatory (85vw cards)
        - Tablet/Desktop: 3-column grid
      */}
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-3 gap-4 pb-2 md:pb-0 -mx-4 px-4 sm:-mx-8 sm:px-8 md:mx-0 md:px-0">
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
            }}
            className={`relative rounded-2xl overflow-hidden p-6 min-h-[200px] sm:min-h-[220px] w-[85vw] sm:w-[360px] md:w-auto shrink-0 snap-center md:shrink flex flex-col justify-between ${item.bg} group border border-gray-100/60 shadow-xs transform-gpu will-change-transform hover:md:-translate-y-1 hover:md:shadow-md transition-all duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0"
            }`}
          >
            {/* Subtle interactive hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-500 pointer-events-none rounded-2xl" />

            {/* Product/Furniture floating image on right with smooth GPU-accelerated zoom */}
            <img
              src={item.image}
              alt={item.title}
              className="absolute right-0 bottom-0 w-[45%] h-[85%] object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none rounded-tl-2xl shadow-sm transform-gpu will-change-transform motion-reduce:transform-none"
              style={{
                maskImage: "linear-gradient(to left, black 70%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to left, black 70%, transparent 100%)",
              }}
            />

            {/* Left text column */}
            <div className="relative z-10 max-w-[60%]">
              <h3 className={`text-xl font-black leading-[1.15] tracking-tight ${item.dark ? "text-white" : "text-gray-900"}`}>
                {item.badge}
                <br />
                <span className={item.dark ? "text-emerald-100" : "text-gray-800"}>
                  {item.badgeSub}
                </span>
              </h3>

              <p className={`text-xs mt-2 leading-snug font-medium ${item.dark ? "text-[#F9BC15] text-sm font-black" : "text-gray-600"}`}>
                {item.title}
              </p>
            </div>

            {/* CTA Pill button matching reference with subtle animated arrow */}
            <div className="relative z-10 mt-4">
              <Link
                to={item.link}
                className="inline-flex items-center gap-1.5 bg-[#F9BC15] hover:bg-[#e6ab0f] text-[#003D2B] text-[11px] font-bold px-4 py-2 rounded-full shadow-xs hover:shadow-sm transition-all duration-200 active:scale-95 group/btn"
              >
                <span>{item.cta}</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1.5 transition-transform duration-300 ease-out motion-reduce:transform-none" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PromoBannerGrid;

