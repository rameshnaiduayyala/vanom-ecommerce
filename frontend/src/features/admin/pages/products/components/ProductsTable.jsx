import React from "react";
import { Link } from "react-router-dom";
import { Eye, Edit2, Trash2, Loader2, PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/Badge.jsx";

export function ProductsTable({
  products = [],
  isLoading = false,
  isFetching = false,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
}) {
  return (
    <div className="relative rounded-2xl bg-white border border-border overflow-hidden shadow-2xs">
      {/* Background Fetching Bar Indicator */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00875A] animate-pulse z-10" />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-text-primary">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Product Info</th>
              <th className="p-4">SKU / Code</th>
              <th className="p-4">Category</th>
              <th className="p-4">Type & Badges</th>
              <th className="p-4">🇺🇸 US Price & Stock</th>
              <th className="p-4">🇨🇦 CA Price & Stock</th>
              <th className="p-4">Total Inventory</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading || (isFetching && products.length === 0) ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse bg-white">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-slate-200/80 shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-slate-200/80 rounded w-36" />
                        <div className="h-2.5 bg-slate-100 rounded w-20" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="h-3 bg-slate-200/70 rounded w-20 font-mono" />
                  </td>
                  <td className="p-4">
                    <div className="h-5 bg-slate-200/60 rounded-full w-20" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-slate-200/60 rounded w-16" />
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="h-3.5 bg-slate-200/80 rounded w-16" />
                    <div className="h-2.5 bg-slate-100 rounded w-20" />
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="h-3.5 bg-slate-200/80 rounded w-16" />
                    <div className="h-2.5 bg-slate-100 rounded w-20" />
                  </td>
                  <td className="p-4">
                    <div className="h-3.5 bg-slate-200/80 rounded w-16" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-7 h-7 bg-slate-200/60 rounded-lg" />
                      <div className="w-7 h-7 bg-slate-200/60 rounded-lg" />
                      <div className="w-7 h-7 bg-slate-200/60 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PackageSearch className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-700">No products found</p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting your search query or category filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const usCountry = Array.isArray(p.countries)
                  ? p.countries.find(
                    (c) =>
                      c.currency === "USD" ||
                      c.country?.code === "US" ||
                      c.country === "United States"
                  )
                  : null;
                const caCountry = Array.isArray(p.countries)
                  ? p.countries.find(
                    (c) =>
                      c.currency === "CAD" ||
                      c.country?.code === "CA" ||
                      c.country === "Canada"
                  )
                  : null;

                const priceUsd =
                  usCountry?.price ??
                  p.basePrice ??
                  p.price_usd ??
                  p.priceUS ??
                  p.pricing?.US?.retailPrice ??
                  0;
                const priceCad =
                  caCountry?.price ??
                  p.price_cad ??
                  p.priceCA ??
                  p.pricing?.CA?.retailPrice ??
                  (priceUsd ? (Number(priceUsd) * 1.35).toFixed(2) : 0);
                const stockUs =
                  usCountry?.stock ?? Math.round((p.stock ?? 100) * 0.6);
                const stockCa =
                  caCountry?.stock ??
                  Math.max(0, (p.stock ?? 100) - Math.round((p.stock ?? 100) * 0.6));
                const totalStock = p.stock ?? p.stock_quantity ?? 100;
                const isVariable =
                  p.type === "VARIABLE" ||
                  (Array.isArray(p.variants) && p.variants.length > 0);

                const primaryImg =
                  Array.isArray(p.images) && p.images.length > 0
                    ? typeof p.images[0] === "string"
                      ? p.images[0]
                      : p.images[0]?.url || p.images[0]?.file?.url
                    : p.image ||
                    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80";

                return (
                  <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={primaryImg}
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-cover border border-border shrink-0"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-text-primary leading-tight max-w-xs">
                            {p.name}
                          </h4>
                          <span className="text-[10px] text-text-muted">
                            {p.brand?.name || p.brand || "Vanom Organics"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-text-secondary font-medium">
                      {p.sku || "N/A"}
                    </td>
                    <td className="p-4">
                      <Badge variant="default" size="sm">
                        {typeof p.category === "object"
                          ? p.category?.name
                          : p.category ||
                          p.categories?.[0]?.category?.name ||
                          "General"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 items-center">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isVariable
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {isVariable ? "Variable" : "Simple"}
                        </span>
                        {p.isBestSeller && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Bestseller
                          </span>
                        )}
                        {p.isNew && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900">
                          ${Number(priceUsd).toFixed(2)}
                        </span>
                        {/* {p.costPrice != null && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            Cost: ${Number(p.costPrice).toFixed(2)}
                          </div>
                        )} */}
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          {stockUs} in stock
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-blue-900">
                          CA${Number(priceCad).toFixed(2)}
                        </span>
                        <div className="text-[10px] text-blue-700 font-semibold">
                          {stockCa} in stock
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${totalStock < 20 ? "text-amber-600" : "text-emerald-700"
                          }`}
                      >
                        {totalStock} units
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewProduct(p)}
                          className="p-1.5 text-text-muted hover:text-brand-600 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/products/new?edit=${p.id || p.slug}`}
                          className="p-1.5 text-text-muted hover:text-blue-600 rounded-lg hover:bg-surface-muted transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(p)}
                          className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsTable;
