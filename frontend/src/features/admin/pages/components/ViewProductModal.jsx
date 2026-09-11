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
          <span>Fetching live product data from API...</span>
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

              <p className="text-text-secondary text-xs leading-relaxed pt-1">
                {product.description || "No description provided for this catalog product."}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted">Available Stock</span>
              <div className="text-base font-black text-emerald-700">
                {(product.stock_quantity ?? product.stock ?? 100).toLocaleString()} <span className="text-[10px] font-normal text-text-muted">Units</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted">USD Retail Price</span>
              <div className="text-base font-black text-slate-900">
                ${product.price_usd ?? product.priceUS ?? product.pricing?.US?.retailPrice ?? "0.00"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted">CAD Retail Price</span>
              <div className="text-base font-black text-blue-900">
                CA${product.price_cad ?? product.priceCA ?? product.pricing?.CA?.retailPrice ?? "0.00"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted">Total Variants</span>
              <div className="text-base font-black text-[#00875A]">
                {variants.length > 0 ? variants.length : 1}
              </div>
            </div>
          </div>

          {/* Variants Table if present */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00875A]" />
                Product Variants Breakdown ({variants.length})
              </h5>
              <div className="border border-border rounded-xl overflow-hidden text-xs bg-white">
                <table className="w-full text-left">
                  <thead className="bg-surface-muted text-[11px] uppercase font-semibold text-text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Variant Option</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3">USD Price</th>
                      <th className="p-3">CAD Price</th>
                      <th className="p-3">Stock Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {variants.map((v, i) => (
                      <tr key={v.id || i} className="hover:bg-surface-muted/50">
                        <td className="p-3 font-bold text-text-primary">
                          {v.variant_name || v.name || `Option ${i + 1}`}
                        </td>
                        <td className="p-3 font-mono text-text-muted">{v.sku || "N/A"}</td>
                        <td className="p-3">{v.weight ? `${v.weight} KG` : "1.0 KG"}</td>
                        <td className="p-3 font-bold text-slate-900">${v.price_usd || product.price_usd || 0}</td>
                        <td className="p-3 font-bold text-blue-900">CA${v.price_cad || (Number(v.price_usd || product.price_usd || 0) * 1.35).toFixed(2)}</td>
                        <td className="p-3">
                          <span className="font-bold text-emerald-700">
                            {(v.stock_quantity ?? v.stock ?? 50).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
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
