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
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Spinner } from "../../../components/ui/Alert.jsx";

export function B2BProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["b2b-product-detail", slug, country.code],
    queryFn: () => Api.catalog.getProductBySlug(slug),
  });

  const [quantity, setQuantity] = useState(20);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center text-white">
        <h2 className="text-xl font-bold">Wholesale Product Not Found</h2>
        <Link to={ROUTES.B2B.CATALOG} className="mt-4 inline-block">
          <Button variant="gold" size="sm">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const tiers = pricing.wholesaleTiers || [];
  const moq = pricing.moq || 20;

  // Resolve matching tier price based on current quantity
  const activeTier =
    tiers.find((t) => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity)) ||
    tiers[0] ||
    { unitPrice: 420 };

  const unitPrice = activeTier.unitPrice;
  const isMoqMet = quantity >= moq;
  const totalAmount = isMoqMet ? unitPrice * quantity : 0;
  const palletsCount = product.packaging?.palletQuantity
    ? (quantity / product.packaging.palletQuantity).toFixed(1)
    : "1.0";

  const handleCreateQuote = () => {
    if (!isMoqMet) {
      addToast({
        title: "MOQ Requirement Not Met",
        message: `Minimum Order Quantity for this product is ${moq} units.`,
        type: "error",
      });
      return;
    }

    addToast({
      title: "Quote Inquiry Created",
      message: `Quotation requested for ${quantity}x ${product.name}`,
      type: "success",
    });
    navigate(ROUTES.B2B.QUOTES);
  };

  return (
    <div className="space-y-6">
      <Link to={ROUTES.B2B.CATALOG} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Wholesale Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Tier Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-lg font-mono">
                Wholesale SKU: {product.sku}
              </span>
              <Badge variant="green" size="sm">
                MOQ: {moq} {product.packaging?.unitName}s
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Wholesale Quantity Tier Matrix */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Commercial Volume Pricing Tiers ({country.currency})
              </h3>
              <span className="text-xs text-slate-400">Authoritative Pricing</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tier Level</th>
                    <th className="p-3">Order Quantity Range</th>
                    <th className="p-3">Unit Price ({country.currency})</th>
                    <th className="p-3">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {tiers.map((t, idx) => {
                    const isCurrentTier =
                      quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity);

                    return (
                      <tr
                        key={idx}
                        className={isCurrentTier ? "bg-emerald-50/80 font-bold text-emerald-900" : ""}
                      >
                        <td className="p-3">Tier {idx + 1}</td>
                        <td className="p-3">
                          {t.maxQuantity ? `${t.minQuantity} - ${t.maxQuantity}` : `${t.minQuantity}+`}{" "}
                          {product.packaging?.unitName}s
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {formatPrice(t.unitPrice, country.currency, country.symbol)}
                        </td>
                        <td className="p-3 text-emerald-700 font-semibold">
                          {idx === 0 ? "Standard B2B" : idx === 1 ? "Save ~8%" : "Save ~18% (Best Tier)"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pallet & Packaging Specifications */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              Pallet & Logistics Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Unit Packaging</span>
                <span className="font-bold text-slate-900">{product.packaging?.unitName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Unit Weight</span>
                <span className="font-bold text-slate-900">{product.packaging?.weightKg} KG</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Full Pallet Spec</span>
                <span className="font-bold text-emerald-700">{product.packaging?.palletQuantity} Units</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Pallet Weight</span>
                <span className="font-bold text-slate-900">{product.packaging?.palletWeightKg} KG</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Interactive Bulk Configurator */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-slate-800 space-y-5 sticky top-24 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800">
              Wholesale Order Configurator
            </h3>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Select Order Quantity:</span>
                <span className="text-emerald-700 font-mono font-bold">{quantity} units</span>
              </label>
              <input
                type="number"
                min="1"
                step="5"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-base focus:border-[#006B3C] focus:outline-none"
              />

              {/* MOQ Alert */}
              {!isMoqMet ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>
                    Minimum order requirement is <strong>{moq} {product.packaging?.unitName}s</strong>.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> MOQ Met
                  </span>
                  <span className="font-mono font-bold">~{palletsCount} Pallets</span>
                </div>
              )}
            </div>

            {/* Price Calculation Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Effective Unit Price</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(unitPrice, country.currency, country.symbol)} / unit
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Commercial Quantity</span>
                <span className="font-semibold text-slate-900">{quantity} units</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-sm font-bold text-slate-900">
                <span>Estimated Subtotal</span>
                <span className="text-xl font-black text-slate-900">
                  {formatPrice(totalAmount, country.currency, country.symbol)}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <Button
                variant="primary"
                size="lg"
                onClick={handleCreateQuote}
                disabled={!isMoqMet}
                className="w-full font-bold shadow-xs cursor-pointer"
                icon={FileSpreadsheet}
              >
                Submit Quote Request
              </Button>
              <Link to={ROUTES.B2B.BULK_ORDER} className="block">
                <Button variant="outline" size="sm" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer">
                  Add to Bulk Order Sheet
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
