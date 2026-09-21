import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Package } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";
import { useAddProductForm } from "./hooks/useAddProductForm.js";
import { BasicInfoCard } from "./components/BasicInfoCard.jsx";
import { SimplePricingCard } from "./components/SimplePricingCard.jsx";
import { VariantsPricingCard } from "./components/VariantsPricingCard.jsx";
import { ProductImagesCard } from "./components/ProductImagesCard.jsx";
import { ProductSidebarSettings } from "./components/ProductSidebarSettings.jsx";

export function AdminAddProductPage() {
  const {
    isEditMode,
    formData,
    setFormData,
    categories,
    brands,
    isPending,
    addVariantRow,
    removeVariantRow,
    updateVariantRow,
    addHighlightRow,
    removeHighlightRow,
    updateHighlightRow,
    handleAddImageUrl,
    handleRemoveImageUrl,
    handleSubmit,
    navigateToList,
  } = useAddProductForm();

  return (
    <div className="mx-auto pb-24 space-y-6">
      {/* ── Top Header Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to={ROUTES.ADMIN.PRODUCTS} className="hover:text-slate-800 transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {isEditMode ? "Edit Product" : "New Master Product"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={navigateToList}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Back to Products Catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {isEditMode ? `Edit Product: ${formData.name || "Untitled"}` : "Add Enterprise Product"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Main Column: Product Configuration (8 cols) ── */}
          <div className="lg:col-span-8 space-y-6">
            <BasicInfoCard
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              brands={brands}
            />

            {formData.product_type === "simple" ? (
              <SimplePricingCard formData={formData} setFormData={setFormData} />
            ) : (
              <VariantsPricingCard
                formData={formData}
                addVariantRow={addVariantRow}
                removeVariantRow={removeVariantRow}
                updateVariantRow={updateVariantRow}
              />
            )}

            <ProductImagesCard
              formData={formData}
              handleAddImageUrl={handleAddImageUrl}
              handleRemoveImageUrl={handleRemoveImageUrl}
            />
          </div>

          {/* ── Sidebar Column: Publishing, Badges, Logistics (4 cols) ── */}
          <div className="lg:col-span-4 space-y-6">
            <ProductSidebarSettings
              formData={formData}
              setFormData={setFormData}
              addHighlightRow={addHighlightRow}
              removeHighlightRow={removeHighlightRow}
              updateHighlightRow={updateHighlightRow}
              isEditMode={isEditMode}
              isPending={isPending}
              onCancel={navigateToList}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminAddProductPage;
