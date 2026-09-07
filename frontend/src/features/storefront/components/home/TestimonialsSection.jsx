import React from "react";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    id: "r1",
    name: "Arya R.",
    role: "Verified Buyer",
    text: "Great quality products and super fast delivery. Shopping on Vanom is always a smooth experience.",
    rating: 5,
    avatar: "https://i.pravatar.cc/60?img=21",
  },
  {
    id: "r2",
    name: "Rahul K.",
    role: "Verified Buyer",
    text: "Excellent service and genuine products. Shopping on Vanom is always a delightful experience.",
    rating: 5,
    avatar: "https://i.pravatar.cc/60?img=32",
  },
  {
    id: "r3",
    name: "Ananya R.",
    role: "Verified Buyer",
    text: "I loved the wide range of products and easy returns. Highly recommend Vanom for all your shopping needs!",
    rating: 5,
    avatar: "https://i.pravatar.cc/60?img=47",
  },
];

export function TestimonialsSection({ reviews = REVIEWS }) {
  const items = reviews.length > 0 ? reviews : REVIEWS;

  return (
    <section className="py-10 bg-[#f8f9fa]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">What Our Customers Say</h2>
          <button className="text-xs font-bold text-[#006B3C] hover:text-[#003D2B] transition-colors">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.slice(0, 3).map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={review.avatar || `https://i.pravatar.cc/60?u=${review.id}`}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">{review.name}</p>
                  <p className="text-[10px] text-gray-500">{review.role}</p>
                  <div className="flex mt-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= (review.rating || 5) ? "text-[#D9A514] fill-[#D9A514]" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
                <Quote className="w-5 h-5 text-[#006B3C]/20 ml-auto shrink-0 mt-1" />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
