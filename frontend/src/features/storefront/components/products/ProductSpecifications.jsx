import React from "react";

export function ProductSpecifications({ features = [], specifications = {} }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
      {/* Left: About This Item */}
      <div className="lg:col-span-6 space-y-3">
        <h3 className="text-base font-bold text-gray-900">About this item</h3>
        <ul className="space-y-2 text-xs sm:text-sm text-gray-600 list-disc list-inside leading-relaxed">
          {features.map((feat, i) => (
            <li key={i}>{feat}</li>
          ))}
        </ul>
      </div>

      {/* Right: Brand Specifications Table */}
      <div className="lg:col-span-6 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-xs">
          {Object.entries(specifications).map(([k, val], idx) => (
            <div
              key={idx}
              className={`grid grid-cols-2 px-4 py-2.5 ${
                idx % 2 === 0 ? "bg-gray-50/70" : "bg-white"
              } border-b border-gray-100 last:border-b-0`}
            >
              <span className="font-bold text-gray-700">{k}</span>
              <span className="text-gray-600">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductSpecifications;
