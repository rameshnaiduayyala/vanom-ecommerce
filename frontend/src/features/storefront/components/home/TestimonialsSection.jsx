import React from "react";
import { Star } from "lucide-react";

const REVIEWS = [
  {
    id: "r1",
    name: "Priya S.",
    role: "Verified Buyer",
    text: "Great quality products and super fast delivery. Vanom is now my go-to store for everything I need!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "r2",
    name: "Rahul K.",
    role: "Verified Buyer",
    text: "Excellent service and genuine products. Shopping on Vanom is always a smooth experience.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "r3",
    name: "Ananya R.",
    role: "Verified Buyer",
    text: "Loved the wide range of products and easy returns. Highly recommended!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
  },
];

export function TestimonialsSection({ reviews = REVIEWS, className = "" }) {
  const items = reviews.length > 0 ? reviews : REVIEWS;

  return (
    <section className={`py-10 bg-white/60 border-t border-[#ebdcb0]/50 ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            What Our Customers Say
          </h2>
          <button className="text-xs font-bold text-[#006B3C] hover:text-[#003D2B] transition-colors cursor-pointer">
            View All →
          </button>
        </div>

        {/* 3 Review Cards matching reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#006B3C]/30 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Star Rating Top */}
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-3.5 h-3.5 text-[#F9BC15] fill-[#F9BC15]"
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-xs text-gray-700 leading-relaxed font-normal mb-4">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Customer Info Bottom */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {review.name}
                  </p>
                  <p className="text-[10px] font-semibold text-[#006B3C]">
                    {review.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;

