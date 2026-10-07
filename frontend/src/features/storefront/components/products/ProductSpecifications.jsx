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
 * Backward compatibility wrapper
 */
export function ProductSpecifications({ description = "", features = [], specifications = {} }) {
  return (
    <div className="space-y-6">
      <ProductDescriptionSection description={description} features={features} />
    </div>
  );
}

export default ProductSpecifications;
