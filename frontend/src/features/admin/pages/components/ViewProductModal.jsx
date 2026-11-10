import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { Modal } from "@/components/ui/Modal.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import {
  Package,
  Layers,
  Boxes,
  DollarSign,
  Tag,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import TiptapViewer from "@/components/common/TiptapViewer";

export function ViewProductModal({ productId, isOpen, onClose }) {
  const { data: rawProduct, isLoading, isError } = useQuery({
    queryKey: ["admin-product-detail", productId],
    queryFn: () => Api.catalog.getProductBySlug(productId),
    enabled: Boolean(productId && isOpen),
  });

  const product = rawProduct?.data || rawProduct;

  if (!isOpen) return null;

  const categoryName =
    typeof product?.category === "object"
      ? product?.category?.name
      : product?.category ||
      (Array.isArray(product?.categories) && product?.categories[0]?.category?.name) ||
      "General";

  const brandName =
    typeof product?.brand === "object"
      ? product?.brand?.name
      : product?.brand || "Vanom";

  const images = Array.isArray(product?.images) && product?.images.length > 0
    ? product.images.map((img) => (typeof img === "string" ? img : img?.file?.url || img?.url)).filter(Boolean)
    : [product?.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"];

  const variants = Array.isArray(product?.variants) ? product.variants : [];

  const usCountry = Array.isArray(product?.countries)
    ? product.countries.find(
        (c) =>
          c.currency === "USD" ||
          c.country?.code === "US" ||
          c.country?.name === "United States" ||
          c.country === "United States"
      )
    : null;

  const caCountry = Array.isArray(product?.countries)
    ? product.countries.find(
        (c) =>
          c.currency === "CAD" ||
          c.country?.code === "CA" ||
          c.country?.name === "Canada" ||
          c.country === "Canada"
      )
    : null;

  const priceUsd =
    usCountry?.price != null
      ? Number(usCountry.price)
      : product?.basePrice != null
      ? Number(product.basePrice)
      : product?.price_usd != null
      ? Number(product.price_usd)
      : product?.priceUS != null
      ? Number(product.priceUS)
      : 0;

  const priceCad =
    caCountry?.price != null
      ? Number(caCountry.price)
      : product?.price_cad != null
      ? Number(product.price_cad)
      : product?.priceCA != null
      ? Number(product.priceCA)
      : priceUsd > 0
      ? Number((priceUsd * 1.35).toFixed(2))
      : 0;

  const rawCostPrice =
    product?.costPrice != null
      ? Number(product.costPrice)
      : product?.cost_price != null
      ? Number(product.cost_price)
      : null;

  const costPrice =
    rawCostPrice !== null && !isNaN(rawCostPrice) && rawCostPrice > 0
      ? rawCostPrice
      : null;

  const totalStock =
    ((usCountry?.stock ?? 0) + (caCountry?.stock ?? 0)) ||
    (product?.stock_quantity ?? product?.stock ?? 0);

  const unitProfit = priceUsd > 0 && costPrice !== null ? priceUsd - costPrice : null;
  const marginPct =
    priceUsd > 0 && costPrice !== null ? ((unitProfit / priceUsd) * 100).toFixed(1) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Inspection & Details"
      maxWidth="max-w-4xl"
    >
      {isLoading ? (
        <div className="py-12 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#00875A] border-t-transparent rounded-full animate-spin" />
          <span>Loading product details</span>
        </div>
      ) : isError || !product ? (
        <div className="py-10 text-center text-xs text-red-600 flex flex-col items-center justify-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="font-semibold">Unable to load product dossier from API.</p>
        </div>
      ) : (
        <div className="space-y-6 text-xs text-text-primary max-h-[75vh] overflow-y-auto pr-1">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row gap-4 items-start pb-4 border-b border-border">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-border bg-surface-muted shrink-0 shadow-2xs">
              <img
                src={images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80";
                }}
              />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand" size="sm">
                  {categoryName}
                </Badge>
                <Badge variant="default" size="sm">
                  {brandName}
                </Badge>
                {product.status && (
                  <Badge
                    variant={product.status === "ACTIVE" ? "success" : "neutral"}
                    size="sm"
                  >
                    {product.status}
                  </Badge>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
                {product.name}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted font-mono">
                <span>SKU: <strong className="text-text-primary font-semibold">{product.sku || "N/A"}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-text-primary font-semibold uppercase">{product.product_type || (variants.length > 1 ? "Variable" : "Simple")}</strong></span>
              </div>

              {product.description ? (
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                    Product Description
                  </span>
                  <div className="bg-white p-3.5 rounded-xl border border-border shadow-2xs">
                    <TiptapViewer content={product.description} />
                  </div>
                </div>
              ) : (
                <p className="text-text-secondary text-xs leading-relaxed pt-1 italic">
                  No description provided for this catalog product.
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted">Available Stock</span>
              <div className="text-base font-black text-emerald-700">
                {totalStock.toLocaleString()}{" "}
                <span className="text-[10px] font-normal text-text-muted">Units</span>
              </div>
              {(usCountry?.stock !== undefined || caCountry?.stock !== undefined) && (
                <div className="text-[10px] text-text-muted font-mono font-medium">
                  {usCountry?.stock ?? 0} US / {caCountry?.stock ?? 0} CA
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted flex items-center justify-between">
                <span>USD Retail Price</span>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-1 py-0.2 rounded">
                  🇺🇸 USD
                </span>
              </span>
              <div className="text-base font-black text-slate-900 font-mono">
                ${priceUsd > 0 ? priceUsd.toFixed(2) : "0.00"}
              </div>
              {usCountry?.oldPrice && (
                <span className="text-[10px] text-text-muted line-through font-mono">
                  ${Number(usCountry.oldPrice).toFixed(2)}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted flex items-center justify-between">
                <span>CAD Retail Price</span>
                <span className="text-[9px] font-bold text-blue-800 bg-blue-100/80 px-1 py-0.2 rounded">
                  🇨🇦 CAD
                </span>
              </span>
              <div className="text-base font-black text-blue-900 font-mono">
                CA${priceCad > 0 ? priceCad.toFixed(2) : "0.00"}
              </div>
              {caCountry?.oldPrice && (
                <span className="text-[10px] text-text-muted line-through font-mono">
                  CA${Number(caCountry.oldPrice).toFixed(2)}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted flex items-center justify-between">
                <span>Buying / Cost Price</span>
                {marginPct !== null && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      parseFloat(marginPct) >= 30
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {marginPct}%
                  </span>
                )}
              </span>
              <div className="text-base font-black text-purple-950 font-mono">
                {costPrice != null ? `$${costPrice.toFixed(2)}` : "—"}
              </div>
              {unitProfit !== null && (
                <span className="text-[10px] text-emerald-700 font-semibold">
                  +${unitProfit.toFixed(2)} unit profit
                </span>
              )}
            </div>
          </div>

          {/* Variants Table if present */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00875A]" />
                Product Variants Breakdown ({variants.length})
              </h5>
              <div className="border border-border rounded-xl overflow-hidden text-xs bg-white shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-surface-muted text-[11px] uppercase font-semibold text-text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Variant Option</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3 bg-purple-50/60 text-purple-950"></th>
                      <th className="p-3 bg-emerald-50/60 text-emerald-950">USD Price</th>
                      <th className="p-3 bg-blue-50/60 text-blue-950">CAD Price</th>
                      <th className="p-3">Stock Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {variants.map((v, i) => {
                      const vUs = Array.isArray(v.countries)
                        ? v.countries.find(
                            (c) =>
                              c.currency === "USD" ||
                              c.country?.code === "US" ||
                              c.country?.name === "United States" ||
                              c.country === "United States"
                          )
                        : null;
                      const vCa = Array.isArray(v.countries)
                        ? v.countries.find(
                            (c) =>
                              c.currency === "CAD" ||
                              c.country?.code === "CA" ||
                              c.country?.name === "Canada" ||
                              c.country === "Canada"
                          )
                        : null;

                      const vPriceUsd =
                        vUs?.price != null
                          ? Number(vUs.price)
                          : v.price_usd != null
                          ? Number(v.price_usd)
                          : priceUsd;

                      const vPriceCad =
                        vCa?.price != null
                          ? Number(vCa.price)
                          : v.price_cad != null
                          ? Number(v.price_cad)
                          : vPriceUsd > 0
                          ? Number((vPriceUsd * 1.35).toFixed(2))
                          : 0;

                      const rawVCostPrice =
                        v.costPrice != null
                          ? Number(v.costPrice)
                          : v.cost_price != null
                          ? Number(v.cost_price)
                          : null;

                      const vCostPrice =
                        rawVCostPrice !== null && !isNaN(rawVCostPrice) && rawVCostPrice > 0
                          ? rawVCostPrice
                          : null;

                      const vStock =
                        ((vUs?.stock || 0) + (vCa?.stock || 0)) ||
                        (v.stock_quantity ?? v.stock ?? 0);

                      return (
                        <tr key={v.id || i} className="hover:bg-surface-muted/50">
                          <td className="p-3 font-bold text-text-primary">
                            {v.variant_name || v.name || `Option ${i + 1}`}
                          </td>
                          <td className="p-3 font-mono text-text-muted">{v.sku || "N/A"}</td>
                          <td className="p-3">
                            {v.weight
                              ? `${v.weight} ${(v.weightUnit || product.weightUnit || "lb").toUpperCase()}`
                              : "—"}
                          </td>
                          <td className="p-3 font-mono text-purple-900 bg-purple-50/20">
                            {vCostPrice != null ? `$${vCostPrice.toFixed(2)}` : "—"}
                          </td>
                          <td className="p-3 font-bold text-slate-900 bg-emerald-50/20 font-mono">
                            ${vPriceUsd > 0 ? vPriceUsd.toFixed(2) : "0.00"}
                          </td>
                          <td className="p-3 font-bold text-blue-900 bg-blue-50/20 font-mono">
                            CA${vPriceCad > 0 ? vPriceCad.toFixed(2) : "0.00"}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-emerald-700 font-mono">
                              {vStock.toLocaleString()}
                            </span>
                            {(vUs?.stock !== undefined || vCa?.stock !== undefined) && (
                              <span className="text-[10px] text-text-muted ml-1.5 font-normal">
                                ({vUs?.stock ?? 0} US / {vCa?.stock ?? 0} CA)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Logistics & Pallet Specifications */}
          {product.packaging && (
            <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2">
              <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-text-secondary" />
                Logistics & Pallet Specifications
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-text-muted block text-[10px]">Packaging</span>
                  <span className="font-semibold">{product.packaging?.unitName || "Standard Unit"}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Unit Weight</span>
                  <span className="font-semibold">{product.packaging?.weightKg || 1} KG</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Units / Pallet</span>
                  <span className="font-bold text-[#00875A]">{product.packaging?.palletQuantity || 40} Units</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Max Pallet Weight</span>
                  <span className="font-bold text-slate-900">{product.packaging?.palletWeightKg || 1000} KG</span>
                </div>
              </div>
            </div>
          )}

          {/* Product Gallery */}
          {images.length > 1 && (
            <div className="space-y-2">
              <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                Product Media Assets ({images.length})
              </h5>
              <div className="flex flex-wrap gap-2.5">
                {images.map((img, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-white shadow-2xs">
                    <img src={img} alt={`Asset ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
            <Link
              to={`/admin/products/new?edit=${product.id || product.slug}`}
              className="text-xs font-semibold text-[#00875A] hover:underline flex items-center gap-1"
            >
              <span>Open in Full Catalog Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Button variant="secondary" size="md" onClick={onClose}>
              Close Dossier
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ViewProductModal;
