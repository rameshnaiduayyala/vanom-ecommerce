import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { ROUTES } from "../../../../constants/routes.js";

export function NewLaunchesSection({ products = [], className = "" }) {
  const swiperRef = useRef(null);
  const list = Array.isArray(products) ? products : [];

  if (list.length === 0) {
    return null;
  }

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
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Previous products"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcb0] hover:bg-[#358B5B] hover:text-white text-gray-700 shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Next products"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcb0] hover:bg-[#358B5B] hover:text-white text-gray-700 shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Swiper Carousel */}
        <div className="w-full min-w-0 pb-3 pt-1">
          <Swiper
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Navigation, FreeMode, Autoplay]}
            spaceBetween={16}
            slidesPerView={2}
            grabCursor={true}
            freeMode={{
              enabled: true,
              sticky: false,
            }}
            breakpoints={{
              480: {
                slidesPerView: 2.3,
                spaceBetween: 12,
              },
              640: {
                slidesPerView: 3.2,
                spaceBetween: 14,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 18,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 20,
              },
            }}
            className="w-full !overflow-visible"
          >
            {list.map((prod) => (
              <SwiperSlide key={prod.id || prod._id} className="!h-auto flex">
                <div className="w-full h-full flex flex-col">
                  <ProductCardCompact product={prod} badge="New Launch" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default NewLaunchesSection;
