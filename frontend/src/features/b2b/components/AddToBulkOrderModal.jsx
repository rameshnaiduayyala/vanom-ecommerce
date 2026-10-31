import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { formatPrice } from "@/utils/formatters.js";
import { ROUTES } from "@/constants/routes.js";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";
import { Boxes, Scale, Check, Plus, Minus, ShoppingCart } from "lucide-react";
import { toast } from "@/components/ui/Toast.jsx";

/**
 * AddToBulkOrderModal — Interactive popup from B2B Catalog to select variant & quantity
 * before adding to the Bulk Order Sheet / Matrix.
 */
export function AddToBulkOrderModal({
  isOpen,
  onClose,
  product,
  targetCountryCode,
  currencyCode,
  currencySymbol,
}) {
  const navigate = useNavigate();

  const variants = Array.isArray(product?.variants) && product.variants.length > 0
    ? product.variants.filter((v) => v.isActive !== false)
    : [];

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(10);

  // Initialize selected variant whenever modal opens or product changes
  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariantId(variants[0].id);
    } else {
      setSelectedVariantId(null);
    }
    setQuantity(10);
  }, [product, isOpen]);

  if (!product) return null;

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0] || null;

  // Resolve Unit Price for active variant
  let unitPrice = 0;
  if (activeVariant) {
    const cp = activeVariant.countryPrices?.find(
      (p) => p.countryCode?.toUpperCase() === targetCountryCode && p.isAvailable !== false
    ) || activeVariant.countryPrices?.[0];

    unitPrice = cp?.unitPrice !== undefined && cp?.unitPrice !== null
      ? Number(cp.unitPrice)
      : Number(cp?.tiers?.[0]?.price || 0);
  } else {
    const cp = product.countryPrices?.find(
      (p) => p.countryCode?.toUpperCase() === targetCountryCode && p.isAvailable !== false
    ) || product.countryPrices?.[0];

    unitPrice = cp?.unitPrice !== undefined ? Number(cp.unitPrice) : Number(cp?.tiers?.[0]?.price || product.basePriceUSD || 30.0);
  }

  const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);
  const lineTotal = unitPrice * safeQuantity;
  const activeWeightLabel = activeVariant?.name || (activeVariant?.weight ? `${activeVariant.weight}${activeVariant.weightUnit || "kg"}` : "Standard");
  const activeSku = activeVariant?.sku || product.sku;
  const productImage = resolveProductImageUrl(product);

  const handleConfirm = () => {
    const variantParam = activeVariant?.id ? `&variantId=${activeVariant.id}` : "";
    const qtyParam = `&quantity=${safeQuantity}`;

    toast.success(
      "Added to Bulk Order Sheet",
      `${product.name} (${activeWeightLabel}) × ${safeQuantity} units added.`
    );

    onClose();
    navigate(`${ROUTES.B2B.BULK_ORDER}?productId=${product.id}${variantParam}${qtyParam}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Bulk Order Sheet"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Product Identity Header */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <img
            src={productImage}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              {product.category || product.categoryName || "Wholesale Commodity"}
            </span>
            <h3 className="text-sm font-bold text-slate-900 truncate">{product.name}</h3>
            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
              SKU: {activeSku}
            </span>
          </div>
        </div>

        {/* 1. Weight Variant Selector */}
        {variants.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                Select Weight Variant:
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {variants.length} options available
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {variants.map((v) => {
                const isSelected = activeVariant?.id === v.id;
                const cp = v.countryPrices?.find(
                  (p) => p.countryCode?.toUpperCase() === targetCountryCode && p.isAvailable !== false
                ) || v.countryPrices?.[0];

                const vPrice = cp?.unitPrice !== undefined ? Number(cp.unitPrice) : Number(cp?.tiers?.[0]?.price || 0);
                const weightStr = v.name || `${v.weight}${v.weightUnit || "kg"}`;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#006B3C] bg-emerald-50/70 ring-1 ring-[#006B3C] shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-900">{weightStr}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#006B3C] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black text-emerald-800 font-mono mt-1">
                      {formatPrice(vPrice, currencyCode, currencySymbol)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Quantity Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Wholesale Quantity (Units):</span>
            <span className="text-xs font-semibold text-emerald-700 font-mono">
              MOQ: 1 unit
            </span>
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, (parseInt(q, 10) || 1) - 5))}
                className="p-2.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="-5 units"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-24 text-center font-bold text-slate-900 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => (parseInt(q, 10) || 1) + 5)}
                className="p-2.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="+5 units"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Quantity Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[10, 25, 50, 100].map((qtyPreset) => (
                <button
                  key={qtyPreset}
                  type="button"
                  onClick={() => setQuantity(qtyPreset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    safeQuantity === qtyPreset
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {qtyPreset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Pricing Calculation Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Unit Wholesale Price ({activeWeightLabel}):</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatPrice(unitPrice, currencyCode, currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Order Quantity:</span>
            <span className="font-semibold text-slate-900">{safeQuantity} units</span>
          </div>
          <div className="border-t border-slate-200 pt-1.5 flex justify-between items-baseline font-bold text-slate-900">
            <span>Estimated Total:</span>
            <span className="text-base font-black text-[#006B3C] font-mono">
              {formatPrice(lineTotal, currencyCode, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-1/3 border-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleConfirm}
            className="flex-1 font-bold shadow-xs bg-[#006B3C] hover:bg-emerald-700"
            icon={Boxes}
          >
            Confirm &amp; Add to Sheet
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default AddToBulkOrderModal;

