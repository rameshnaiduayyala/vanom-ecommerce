import React from "react";
import TiptapViewer from "@/components/common/TiptapViewer";

/**
 * Dedicated Product Overview & Description Section (Tiptap View)
 */
export function ProductDescriptionSection({ description = "", features = [] }) {
  if (!description && (!features || features.length === 0)) {
    return null;
  }

  return (
    <div className="pt-8 border-t border-slate-200/80">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Product Overview & Description</span>
        </h3>

        {description ? (
          <TiptapViewer content={description} />
        ) : (
          <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside leading-relaxed">
            {features.map((feat, i) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Dedicated Technical & Commodity Specifications Table
 */
export function ProductSpecificationsTable({ specifications = {} }) {
  const specEntries = Object.entries(specifications || {});
  if (specEntries.length === 0) {
    return null;
  }

  return (
    <div className="pt-6 border-t border-slate-200/80">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Product Specifications
        </h3>

        <div className="rounded-2xl border border-slate-200/80 overflow-hidden text-sm shadow-2xs">
          {specEntries.map(([k, val], idx) => (
            <div
              key={idx}
              className={`grid grid-cols-1 sm:grid-cols-3 px-5 py-3.5 ${
                idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"
              } border-b border-slate-100 last:border-b-0`}
            >
              <span className="font-bold text-slate-700 sm:col-span-1">{k}</span>
              <span className="text-slate-600 font-medium sm:col-span-2">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Backward compatibility wrapper
 */
export function ProductSpecifications({ description = "", features = [], specifications = {} }) {
  return (
    <div className="space-y-6">
      <ProductDescriptionSection description={description} features={features} />
      <ProductSpecificationsTable specifications={specifications} />
    </div>
  );
}

export default ProductSpecifications;
