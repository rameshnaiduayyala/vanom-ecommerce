import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { Search, Boxes, ArrowRight, Package } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";

export function B2BCatalog() {
  const { country } = useCountryStore();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["b2b-catalog", country.code, search],
    queryFn: () => Api.catalog.getProducts({ search }),
  });

  const products = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Wholesale & Bulk Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative tier pricing & pallet configurations for market:{" "}
            <span className="text-gold-400 font-semibold">{country.name} ({country.currency})</span>
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wholesale SKU or name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-80 rounded-2xl bg-slate-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No wholesale items found"
          description="Try adjusting your search query."
          className="text-slate-300"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
            const tiers = pricing.wholesaleTiers || [];
            const moq = pricing.moq || 20;

            return (
              <div
                key={product.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-gold-500/50 transition-all flex flex-col justify-between overflow-hidden shadow-sm"
              >
                <div>
                  <div className="aspect-16/9 bg-slate-950 overflow-hidden relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-90" />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="bg-slate-900/90 text-gold-400 border border-gold-500/30 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                        MOQ: {moq} {product.packaging?.unitName}s
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                      <h3 className="text-sm font-bold text-white leading-snug mt-0.5">{product.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">SKU: {product.sku}</p>
                    </div>

                    {/* Packaging Info */}
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Packaging:</span>
                        <span className="font-semibold">{product.packaging?.unitName} ({product.packaging?.weightKg} KG)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pallet Spec:</span>
                        <span className="font-semibold">{product.packaging?.palletQuantity} units / pallet</span>
                      </div>
                    </div>

                    {/* Tiered Price Table Preview */}
                    <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
                      <div className="bg-slate-800/80 px-3 py-1.5 font-bold text-slate-300 flex justify-between text-[11px]">
                        <span>Quantity Tier</span>
                        <span>Wholesale Price</span>
                      </div>
                      <div className="divide-y divide-slate-800 bg-slate-950/40">
                        {tiers.map((t, idx) => (
                          <div key={idx} className="px-3 py-1.5 flex justify-between text-[11px] text-slate-200">
                            <span>{t.maxQuantity ? `${t.minQuantity} - ${t.maxQuantity}` : `${t.minQuantity}+`} units</span>
                            <span className="font-bold text-gold-400">
                              {formatPrice(t.unitPrice, country.currency, country.symbol)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link to={`/b2b/catalog/${product.slug}`} className="block">
                    <Button variant="gold" size="sm" className="w-full font-bold text-slate-900 shadow-xs" icon={ArrowRight} iconPosition="right">
                      Configure Wholesale Order
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
