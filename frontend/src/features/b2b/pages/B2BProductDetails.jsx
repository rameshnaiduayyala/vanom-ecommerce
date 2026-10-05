import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  Boxes,
  Layers,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Tag,
  Globe2,
  Scale,
  ShoppingCart
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Spinner } from "../../../components/ui/Alert.jsx";
import { TiptapViewer } from "@/components/common/TiptapViewer.jsx";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

export function B2BProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["b2b-product-detail", slug, country.code],
    queryFn: async () => {
      try {
        const bulkRes = await Api.b2b.getBulkProductById(slug);
        if (bulkRes && (bulkRes.id || bulkRes.name)) {
          return bulkRes?.data || bulkRes;
        }
      } catch (e) {
        // Fallback
      }
      return Api.catalog.getProductBySlug(slug);
    },
  });

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(10);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center text-slate-800">
        <h2 className="text-xl font-bold">Wholesale Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested wholesale commodity could not be retrieved from the catalog.</p>
        <Link to={ROUTES.B2B.CATALOG} className="mt-4 inline-block">
          <Button variant="primary" size="sm">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const targetCountryCode = (country.code || "US").toUpperCase();
  const currencyCode = targetCountryCode === "CA" ? "CAD" : "USD";
  const currencySymbol = targetCountryCode === "CA" ? "CA$" : "$";

  // Resolve weight variants
  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.filter((v) => v.isActive !== false)
    : [];

  // Active Variant Selection (defaults to first variant)
  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0] || null;

  // Resolve country price for the active variant
  let unitPrice = 0;
  if (activeVariant) {
    const cp = activeVariant.countryPrices?.find(
      (p) => p.countryCode?.toUpperCase() === targetCountryCode && p.isAvailable !== false
    ) || activeVariant.countryPrices?.[0];

    unitPrice = cp?.unitPrice !== undefined && cp?.unitPrice !== null
      ? Number(cp.unitPrice)
      : Number(cp?.tiers?.[0]?.price || 0);
  } else {
    // Legacy fallback for simple product without variants
    const cp = product.countryPrices?.find(
      (p) => p.countryCode?.toUpperCase() === targetCountryCode && p.isAvailable !== false
    ) || product.countryPrices?.[0];
    unitPrice = cp?.unitPrice !== undefined ? Number(cp.unitPrice) : Number(cp?.tiers?.[0]?.price || product.basePriceUSD || 0);
  }

  const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);
  const lineTotal = unitPrice * safeQuantity;
  const productImage = resolveProductImageUrl(product);
  const activeWeightLabel = activeVariant?.name || (activeVariant?.weight ? `${activeVariant.weight}${activeVariant.weightUnit || "kg"}` : "Standard");
  const activeSku = activeVariant?.sku || product.sku;

  const handleAddToOrderMatrix = () => {
    // Navigate to Bulk Order Matrix with preselected product and variant
    const variantParam = activeVariant?.id ? `&variantId=${activeVariant.id}` : "";
    const qtyParam = `&quantity=${safeQuantity}`;
    navigate(`${ROUTES.B2B.BULK_ORDER}?productId=${product.id}${variantParam}${qtyParam}`);
    addToast({
      title: "Configured Wholesale Item",
      message: `Added ${product.name} (${activeWeightLabel}) to your bulk order sheet.`,
      type: "success"
    });
  };

  return (
    <div className="space-y-6">
      <Link to={ROUTES.B2B.CATALOG} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Wholesale Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Weight Variant Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card with Image & Identity */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-56 aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_PRODUCT_IMAGE;
                }}
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="bg-white/95 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs font-mono">
                  {variants.length} Weight Options
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-lg font-mono">
                  SKU: {activeSku}
                </span>
                {product.brand && (
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-500" /> {product.brand}
                  </span>
                )}
                {product.category && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {product.category}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3">
                <Globe2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs text-emerald-900 font-medium">
                  Showing wholesale rates for <strong>{country.name || "United States"}</strong> ({currencyCode}). Independent country pricing applied.
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Weight Selection Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                Select Weight & Wholesale Price Option
              </h3>
              <span className="text-xs text-slate-400 font-medium">Click weight to update price</span>
            </div>

            {variants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {variants.map((v) => {
                  const isSelected = activeVariant?.id === v.id;
                  const cp = v.countryPrices?.find(
                    (p) => p.countryCode?.toUpperCase() === targetCountryCode && p.isAvailable !== false
                  ) || v.countryPrices?.[0];

                  const vPrice = cp?.unitPrice !== undefined ? Number(cp.unitPrice) : Number(cp?.tiers?.[0]?.price || 0);
                  const weightStr = v.name || `${v.weight}${v.weightUnit || "kg"}`;

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-slate-900">{weightStr}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-emerald-600 bg-emerald-600" : "border-slate-300"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                        <span className="text-[11px] text-slate-500 uppercase font-semibold">Price:</span>
                        <span className="text-base font-black text-slate-900 font-mono">
                          {formatPrice(vPrice, currencyCode, currencySymbol)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {v.sku}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No weight variants available.</p>
            )}
          </div>

          {/* Description & Specifications */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Wholesale Commodity Description
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Verified Commercial Specifications</span>
            </div>

            {product.description ? (
              <div className="prose-sm max-w-none text-slate-700">
                <TiptapViewer content={product.description} />
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No detailed rich description provided for this wholesale commodity.
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Interactive Wholesale Order Configurator */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-slate-800 space-y-5 sticky top-24 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              Wholesale Order Configurator
            </h3>

            {/* Selected Weight Display */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Selected Weight Variant:</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">{activeWeightLabel}</span>
                  <span className="text-[10px] text-slate-400 font-mono">SKU: {activeSku}</span>
                </div>
                <Badge variant="green" size="sm">
                  {country.code || "US"} Market
                </Badge>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Wholesale Quantity:</span>
                <span className="text-emerald-700 font-mono font-bold">{safeQuantity} units</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-base focus:border-[#006B3C] focus:outline-none"
              />
            </div>

            {/* Pricing Calculation Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Unit Price ({activeWeightLabel})</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {formatPrice(unitPrice, currencyCode, currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Order Quantity</span>
                <span className="font-semibold text-slate-900">{safeQuantity} units</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-sm font-bold text-slate-900">
                <span>Line Total</span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {formatPrice(lineTotal, currencyCode, currencySymbol)}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToOrderMatrix}
                className="w-full font-bold shadow-xs cursor-pointer bg-emerald-700 hover:bg-emerald-600 text-white"
                icon={ShoppingCart}
              >
                Add {activeWeightLabel} to Order
              </Button>
              <Link to={ROUTES.B2B.BULK_ORDER} className="block">
                <Button variant="outline" size="sm" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer">
                  Open Bulk Order Matrix
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default B2BProductDetails;
