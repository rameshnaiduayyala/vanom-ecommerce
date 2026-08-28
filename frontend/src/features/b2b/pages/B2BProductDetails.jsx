import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
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
    <div className="space-y-8">
      <Link to={ROUTES.B2B.CATALOG} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Wholesale Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Tier Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 text-gold-400 border border-gold-500/30 text-xs font-bold px-2.5 py-1 rounded font-mono">
                Wholesale SKU: {product.sku}
              </span>
              <Badge variant="gold" size="sm">
                MOQ: {moq} {product.packaging?.unitName}s
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">{product.description}</p>
          </div>

          {/* Wholesale Quantity Tier Matrix */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold-400" />
                Commercial Volume Pricing Tiers ({country.currency})
              </h3>
              <span className="text-xs text-slate-400">Authoritative Engine</span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-300 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Tier Level</th>
                    <th className="p-3">Order Quantity Range</th>
                    <th className="p-3">Unit Price ({country.currency})</th>
                    <th className="p-3">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40 text-slate-200">
                  {tiers.map((t, idx) => {
                    const isCurrentTier =
                      quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity);

                    return (
                      <tr
                        key={idx}
                        className={isCurrentTier ? "bg-gold-500/10 font-semibold text-gold-300" : ""}
                      >
                        <td className="p-3">Tier {idx + 1}</td>
                        <td className="p-3">
                          {t.maxQuantity ? `${t.minQuantity} - ${t.maxQuantity}` : `${t.minQuantity}+`}{" "}
                          {product.packaging?.unitName}s
                        </td>
                        <td className="p-3 font-bold text-gold-400">
                          {formatPrice(t.unitPrice, country.currency, country.symbol)}
                        </td>
                        <td className="p-3 text-emerald-400">
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
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-gold-400" />
              Pallet & Logistics Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Unit Packaging</span>
                <span className="font-bold text-white">{product.packaging?.unitName}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Unit Weight</span>
                <span className="font-bold text-white">{product.packaging?.weightKg} KG</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Full Pallet Spec</span>
                <span className="font-bold text-gold-400">{product.packaging?.palletQuantity} Units</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Pallet Weight</span>
                <span className="font-bold text-white">{product.packaging?.palletWeightKg} KG</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Interactive Bulk Configurator */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-5 sticky top-24 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400">
              Wholesale Order Configurator
            </h3>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>Select Order Quantity:</span>
                <span className="text-gold-400 font-mono font-bold">{quantity} units</span>
              </label>
              <input
                type="number"
                min="1"
                step="5"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-bold text-base focus:border-gold-500 focus:outline-none"
              />

              {/* MOQ Alert */}
              {!isMoqMet ? (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>
                    Minimum order requirement is <strong>{moq} {product.packaging?.unitName}s</strong>.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> MOQ Requirement Met
                  </span>
                  <span className="font-mono font-bold">~{palletsCount} Pallets</span>
                </div>
              )}
            </div>

            {/* Price Calculation Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Effective Unit Price</span>
                <span className="font-bold text-gold-400">
                  {formatPrice(unitPrice, country.currency, country.symbol)} / unit
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Commercial Quantity</span>
                <span className="font-semibold text-white">{quantity} units</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline text-sm font-bold text-white">
                <span>Estimated Subtotal</span>
                <span className="text-xl font-black text-gold-400">
                  {formatPrice(totalAmount, country.currency, country.symbol)}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <Button
                variant="gold"
                size="lg"
                onClick={handleCreateQuote}
                disabled={!isMoqMet}
                className="w-full font-bold text-slate-900 shadow-sm"
                icon={FileSpreadsheet}
              >
                Submit Quote Request
              </Button>
              <Link to={ROUTES.B2B.BULK_ORDER} className="block">
                <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
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
