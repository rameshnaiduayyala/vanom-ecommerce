import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "../ProductCard.jsx";

export function RelatedProductsSection({ relatedProducts = [] }) {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">You may also like</h3>
        <Link
          to="/products"
          className="text-xs font-bold text-[#006B3C] hover:text-[#003D2B] flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {relatedProducts.map((p, idx) => (
          <ProductCard key={p.id || idx} product={p} />
        ))}
      </div>
    </div>
  );
}

export default RelatedProductsSection;
