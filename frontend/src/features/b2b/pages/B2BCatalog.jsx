import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { Search, Boxes, ArrowRight, Package, Truck, Layers, Plus } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";

export function B2BCatalog() {
  const { country } = useCountryStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Load dedicated B2B Bulk Products from separate BulkProduct database table
  const { data: bulkProducts = [], isLoading } = useQuery({
    queryKey: ["b2b-catalog-bulk-products", search],
    queryFn: () => Api.b2b.getBulkProducts({ search }),
  });

  // Load shared Master Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["shared-categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  // Filter products by category and search term
  const filteredProducts = bulkProducts.filter((product) => {
    if (selectedCategory !== "ALL" && product.categoryId !== selectedCategory) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        (product.originCountry && product.originCountry.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Catalog Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-bold text-emerald-700 uppercase tracking-wider">Commercial Wholesale Catalog</span>
            <span>•</span>
            <span className="text-slate-600">Dedicated B2B Commodities</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Wholesale & Bulk Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Browse private wholesale commodities, pallet specifications, and volume tiered discounts.</p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:border-[#006B3C] focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, commodity, origin..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-[#006B3C] focus:bg-white focus:outline-none"
            />
          </div>

          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button variant="primary" size="sm" icon={Boxes} className="font-bold shadow-xs">
              Open Bulk Order Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-80 rounded-2xl bg-white border border-slate-200" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No wholesale commodities found"
          description="Try adjusting your category filter or search keywords."
          className="text-slate-600 bg-white border border-slate-200 rounded-2xl p-10"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const tiers = product.wholesaleTiers || [];
            const moq = product.moq || 20;
            const basePrice =
              country.currency === "CAD"
                ? product.price_cad || product.basePriceCAD
                : country.currency === "INR"
                ? product.price_inr || product.basePriceINR
                : product.price_usd || product.basePriceUSD || 30.0;

            const productImage =
              product.images?.[0] ||
              product.image ||
              "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=60";

            return (
              <div
                key={product.id}
                className="rounded-2xl bg-white border border-slate-200 hover:border-[#006B3C]/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden shadow-xs"
              >
                <div>
                  {/* Image and MOQ Badge */}
                  <div className="aspect-16/9 bg-slate-100 overflow-hidden relative">
                    <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="bg-white/95 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs font-mono">
                        MOQ: {moq} Units
                      </span>
                      {product.originCountry && (
                        <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-lg shadow-xs">
                          {product.originCountry}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        {product.categoryName || "General Commodity"}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{product.name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>
                    </div>

                    {/* Packaging Specs */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Packaging Type:</span>
                        <span className="font-semibold">{product.packagingType || "Cartons / Sacks"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pallet Spec:</span>
                        <span className="font-semibold text-emerald-800">
                          {product.palletCapacityUnits || (product.unitsPerPackage || 25) * (product.packagesPerPallet || 40)} units / pallet
                        </span>
                      </div>
                      {product.leadTimeDays && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Freight Lead Time:</span>
                          <span className="font-medium text-slate-700">{product.leadTimeDays} business days</span>
                        </div>
                      )}
                    </div>

                    {/* Volume Tiers Breakdown */}
                    {tiers.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                        <div className="bg-slate-50 px-3 py-1.5 font-bold text-slate-600 flex justify-between text-[11px] border-b border-slate-200">
                          <span>Volume Quantity Tier</span>
                          <span>Unit Price ({country.currency})</span>
                        </div>
                        <div className="divide-y divide-slate-100 bg-white">
                          {tiers.slice(0, 3).map((t, idx) => {
                            const tierPrice =
                              country.currency === "CAD"
                                ? t.unitPriceCAD
                                : country.currency === "INR"
                                ? t.unitPriceINR
                                : t.unitPriceUSD || t.unitPrice;

                            return (
                              <div key={idx} className="px-3 py-1.5 flex justify-between text-[11px] text-slate-700">
                                <span>{t.maxQuantity ? `${t.minQuantity} - ${t.maxQuantity}` : `${t.minQuantity}+`} units</span>
                                <span className="font-bold text-slate-900">
                                  {formatPrice(tierPrice || basePrice, country.currency, country.symbol)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Wholesale Base Rate:</span>
                        <span className="font-black text-slate-900 text-sm">
                          {formatPrice(basePrice, country.currency, country.symbol)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action: Add directly to Matrix */}
                <div className="p-5 pt-0">
                  <Link to={`${ROUTES.B2B.BULK_ORDER}?productId=${product.id}`} className="block">
                    <Button variant="primary" size="sm" className="w-full font-bold shadow-xs" icon={Boxes}>
                      Add to Bulk Order Sheet
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

export default B2BCatalog;

