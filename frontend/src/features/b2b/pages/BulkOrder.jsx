import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useAuthStore } from "../../../stores/auth.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { toast } from "../../../components/ui/Toast.jsx";
import {
  Boxes,
  Plus,
  Trash2,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Scale,
  ChevronDown,
  Package,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

/* ─── Small UI atoms ─── */
function CountryBadge({ code }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
      {code}
    </span>
  );
}

function WeightBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
      <Scale className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

export function BulkOrder() {
  const [searchParams] = useSearchParams();
  const requestedProductId = searchParams.get("productId");
  const requestedVariantId = searchParams.get("variantId");
  const requestedQty = searchParams.get("quantity");

  const { country } = useCountryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const targetCountryCode = (country.code || "US").toUpperCase();
  const currencyCode = targetCountryCode === "CA" ? "CAD" : "USD";
  const currencySymbol = targetCountryCode === "CA" ? "CA$" : "$";

  /* ─── Data ─── */
  const { data: bulkProducts = [], isLoading: loadingProducts, refetch } = useQuery({
    queryKey: ["b2b-bulk-products"],
    queryFn: () => Api.b2b.getBulkProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["shared-categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  /* ─── State ─── */
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("");
  const [selectedVariantToAdd, setSelectedVariantToAdd] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState([]);

  const [bottomProductToAdd, setBottomProductToAdd] = useState("");
  const [bottomVariantToAdd, setBottomVariantToAdd] = useState("");
  const [bottomQuantity, setBottomQuantity] = useState(10);

  /* ─── Derived ─── */
  const currentChosenProduct = bulkProducts.find((p) => p.id === selectedProductToAdd);
  const currentProductVariants = Array.isArray(currentChosenProduct?.variants)
    ? currentChosenProduct.variants.filter((v) => v.isActive !== false)
    : [];

  const bottomChosenProduct = bulkProducts.find((p) => p.id === bottomProductToAdd);
  const bottomVariants = Array.isArray(bottomChosenProduct?.variants)
    ? bottomChosenProduct.variants.filter((v) => v.isActive !== false)
    : [];
  const bottomChosenVariant = bottomVariantToAdd
    ? bottomVariants.find((v) => v.id === bottomVariantToAdd)
    : bottomVariants[0] || null;
  const bottomUnitPrice = bottomChosenProduct ? resolveUnitPrice(bottomChosenProduct, bottomChosenVariant) : 0;

  const availableBulkProducts = bulkProducts.filter((p) => {
    if (selectedCategory !== "ALL") {
      const matchedCat = categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory);
      const catId = matchedCat?.id || selectedCategory;
      const catName = (matchedCat?.name || selectedCategory).toLowerCase();
      const prodCat = (p.category || p.categoryName || "").toLowerCase();
      const prodCatId = p.categoryId;
      if (!(prodCatId === catId || prodCat === catName || prodCat.includes(catName))) return false;
    }
    return true;
  });

  /* ─── URL pre-populate ─── */
  useEffect(() => {
    if (requestedProductId && bulkProducts.length > 0) {
      const prod = bulkProducts.find((p) => p.id === requestedProductId);
      if (prod) {
        const variant = requestedVariantId
          ? prod.variants?.find((v) => v.id === requestedVariantId)
          : prod.variants?.[0];
        handleAddLine(prod, variant, requestedQty ? Math.max(1, parseInt(requestedQty, 10)) : 10);
      }
    }
  }, [requestedProductId, requestedVariantId, requestedQty, bulkProducts]);

  /* ─── Helpers ─── */
  function resolveUnitPrice(prod, variant) {
    if (variant) {
      const cp = variant.countryPrices?.find((p) => p.countryCode?.toUpperCase() === targetCountryCode);
      if (cp && cp.unitPrice !== undefined && cp.unitPrice !== null) return Number(cp.unitPrice);
      if (cp?.tiers?.[0]?.price) return Number(cp.tiers[0].price);
    }
    const cp = prod.countryPrices?.find((p) => p.countryCode?.toUpperCase() === targetCountryCode);
    if (cp && cp.unitPrice !== undefined) return Number(cp.unitPrice);
    return Number(prod.basePriceUSD || 0);
  }

  const handleAddLine = (prod, variant = null, initialQuantity = 10) => {
    const variantId = variant?.id || null;
    const rowKey = `${prod.id}_${variantId || "default"}`;
    const existingIndex = rows.findIndex((r) => r.rowKey === rowKey);

    if (existingIndex >= 0) {
      const newRows = [...rows];
      newRows[existingIndex].quantity += initialQuantity;
      setRows(newRows);
      toast.info("Quantity Updated", `Increased qty for ${prod.name}.`);
      return;
    }

    const unitPrice = resolveUnitPrice(prod, variant);
    const weightLabel = variant?.name || (variant?.weight ? `${variant.weight}${variant.weightUnit || "kg"}` : "Standard");

    setRows((prev) => [
      ...prev,
      {
        rowKey,
        productId: prod.id,
        variantId,
        name: prod.name,
        sku: variant?.sku || prod.sku,
        imageUrl: resolveProductImageUrl(prod),
        weight: variant?.weight ?? null,
        weightUnit: variant?.weightUnit || "kg",
        weightLabel,
        quantity: initialQuantity,
        unitPrice,
        currencyCode,
        countryCode: targetCountryCode,
      },
    ]);
    toast.success("Added", `${prod.name} — ${weightLabel} @ ${formatPrice(unitPrice, currencyCode, currencySymbol)}`);
  };

  const handleAddChosenProduct = () => {
    if (!currentChosenProduct) return;
    const variant = selectedVariantToAdd
      ? currentProductVariants.find((v) => v.id === selectedVariantToAdd)
      : currentProductVariants[0] || null;
    handleAddLine(currentChosenProduct, variant, 10);
    setSelectedProductToAdd("");
    setSelectedVariantToAdd("");
  };

  const handleBottomAdd = () => {
    if (!bottomChosenProduct) return;
    handleAddLine(bottomChosenProduct, bottomChosenVariant, bottomQuantity);
    setBottomProductToAdd("");
    setBottomVariantToAdd("");
    setBottomQuantity(10);
  };

  const handleAddAllVariants = (prod, defaultQty = 10) => {
    if (!prod) return;
    const variants = Array.isArray(prod.variants) ? prod.variants.filter((v) => v.isActive !== false) : [];
    if (variants.length === 0) { handleAddLine(prod, null, defaultQty); return; }
    variants.forEach((v) => handleAddLine(prod, v, defaultQty));
    toast.success("All Weights Added", `Added ${variants.length} variants for ${prod.name}.`);
  };

  const handleQuantityChange = (index, qty) => {
    const newRows = [...rows];
    newRows[index].quantity = Math.max(1, parseInt(qty, 10) || 1);
    setRows(newRows);
  };

  const handleRemoveRow = (index) => setRows(rows.filter((_, i) => i !== index));

  const handleExportCSV = () => {
    if (rows.length === 0) { toast.error("Empty Order", "Add products first."); return; }
    const headers = "SKU,Product,Weight,Qty,Unit Price,Currency,Line Total\n";
    const body = rows
      .map((r) => `"${r.sku}","${r.name.replace(/"/g, '""')}","${r.weightLabel}",${r.quantity},${r.unitPrice},"${r.currencyCode}",${(r.unitPrice * r.quantity).toFixed(2)}`)
      .join("\n");
    const blob = new Blob([headers + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VANOM_B2B_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Exported", "Wholesale CSV downloaded.");
  };

  /* ─── Submit ─── */
  const submitOrderMutation = useMutation({
    mutationFn: async () => {
      const company = user?.companyMembers?.[0]?.company;
      const contactPerson = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Procurement Manager";
      return Api.b2b.createBulkOrder({
        countryCode: targetCountryCode,
        shippingCharges: 0,
        tax: 0,
        notes: notes || "Wholesale Purchase Order",
        items: rows.map((r) => ({ productId: r.productId, variantId: r.variantId, quantity: r.quantity, unitPrice: r.unitPrice })),
        shippingAddress: {
          contactName: contactPerson,
          phone: user?.phone || "+1-555-0199",
          addressLine1: typeof company?.address === "string" ? company.address : "Corporate Fulfillment Hub",
          city: company?.city || "HQ",
          state: company?.state || "State",
          postalCode: company?.postalCode || "00000",
          countryCode: targetCountryCode,
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["b2b-bulk-orders-list"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-orders"] });
      toast.success("Order Placed", `PO ${data?.orderNumber || "—"} submitted.`);
      navigate(ROUTES.B2B.ORDERS);
    },
    onError: (err) => toast.error("Submission Failed", err.message || "Failed to submit order."),
  });

  const totalUnits = rows.reduce((s, r) => s + r.quantity, 0);
  const totalSubtotal = rows.reduce((s, r) => s + r.unitPrice * r.quantity, 0);

  /* ─── JSX ─── */
  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl mx-auto space-y-4">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">B2B Wholesale</span>
              <span className="text-slate-300">·</span>
              <CountryBadge code={targetCountryCode} />
              <span className="text-[10px] text-slate-400 font-mono">{currencyCode}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0" />
              Bulk Purchase Order
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Add Product Bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-800">Add Product</span>
            </div>

            <div className="flex items-center flex-wrap gap-2 flex-1">
              {/* Category */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Product */}
              <div className="relative flex-1 min-w-[200px]">
                <select
                  value={selectedProductToAdd}
                  onChange={(e) => { setSelectedProductToAdd(e.target.value); setSelectedVariantToAdd(""); }}
                  className="appearance-none w-full pl-3 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
                >
                  <option value="">— Select Product —</option>
                  {availableBulkProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Weight Variant */}
              {currentProductVariants.length > 0 && (
                <div className="relative min-w-[150px]">
                  <select
                    value={selectedVariantToAdd}
                    onChange={(e) => setSelectedVariantToAdd(e.target.value)}
                    className="appearance-none w-full pl-3 pr-8 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer transition-all"
                  >
                    <option value="">— Weight —</option>
                    {currentProductVariants.map((v) => {
                      const label = v.name || `${v.weight}${v.weightUnit || "kg"}`;
                      const price = resolveUnitPrice(currentChosenProduct, v);
                      return <option key={v.id} value={v.id}>{label} · {formatPrice(price, currencyCode, currencySymbol)}</option>;
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              <button
                type="button"
                onClick={handleAddChosenProduct}
                disabled={!selectedProductToAdd}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line
              </button>

              {currentProductVariants.length > 1 && (
                <button
                  type="button"
                  onClick={() => { handleAddAllVariants(currentChosenProduct, 10); setSelectedProductToAdd(""); setSelectedVariantToAdd(""); }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  All {currentProductVariants.length} Weights
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Table Toolbar */}
          <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Order Lines</span>
              {rows.length > 0 && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {rows.length}
                </span>
              )}
            </div>
            {rows.length > 0 && (
              <span className="text-[10px] text-slate-400 font-mono">
                {totalUnits.toLocaleString()} units · {formatPrice(totalSubtotal, currencyCode, currencySymbol)}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-bold">Product</th>
                  <th className="text-left px-4 py-3 font-bold">SKU</th>
                  <th className="text-left px-4 py-3 font-bold">Weight</th>
                  <th className="text-right px-4 py-3 font-bold">Qty</th>
                  <th className="text-right px-4 py-3 font-bold">Unit Price</th>
                  <th className="text-right px-4 py-3 font-bold">Line Total</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {/* Empty State */}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">No items added yet</p>
                          <p className="text-xs text-slate-400 mt-0.5">Select a product above to begin building your purchase order.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data Rows */}
                {rows.map((row, idx) => {
                  const lineTotal = row.unitPrice * row.quantity;
                  const parentProd = bulkProducts.find((p) => p.id === row.productId);
                  const otherVariants = (parentProd?.variants || []).filter(
                    (v) => v.isActive !== false && v.id !== row.variantId
                  );

                  return (
                    <tr key={row.rowKey || idx} className="group hover:bg-slate-50/60 transition-colors">
                      {/* Product */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={row.imageUrl || FALLBACK_PRODUCT_IMAGE}
                            alt={row.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0 bg-slate-50"
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_PRODUCT_IMAGE; }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate leading-snug">{row.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Wholesale Line Item</div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-400">{row.sku}</span>
                      </td>

                      {/* Weight + siblings */}
                      <td className="px-4 py-3">
                        <div className="space-y-1.5">
                          <WeightBadge label={row.weightLabel} />
                          {otherVariants.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {otherVariants.map((ov) => {
                                const ovLabel = ov.name || `${ov.weight}${ov.weightUnit || "kg"}`;
                                const alreadyAdded = rows.some((r) => r.productId === row.productId && r.variantId === ov.id);
                                return (
                                  <button
                                    key={ov.id}
                                    type="button"
                                    onClick={() => handleAddLine(parentProd, ov, 10)}
                                    title={alreadyAdded ? `+10 to ${ovLabel}` : `Add ${ovLabel}`}
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${alreadyAdded
                                      ? "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                      : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                      }`}
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    {ovLabel}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          className="w-20 px-2 py-1.5 text-sm font-bold text-center rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          {formatPrice(row.unitPrice, currencyCode, currencySymbol)}
                        </span>
                      </td>

                      {/* Line Total */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-black font-mono text-slate-900">
                          {formatPrice(lineTotal, currencyCode, currencySymbol)}
                        </span>
                      </td>

                      {/* Remove (hover-reveal) */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Bottom Quick-Add Row */}
                <tr className="border-t-2 border-emerald-100 bg-emerald-50/30">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center shrink-0">
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="relative flex-1">
                        <select
                          value={bottomProductToAdd}
                          onChange={(e) => { setBottomProductToAdd(e.target.value); setBottomVariantToAdd(""); }}
                          className="appearance-none w-full pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:border-emerald-500 cursor-pointer transition-all"
                        >
                          <option value="">— Add another product —</option>
                          {availableBulkProducts.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-mono text-slate-400">
                      {bottomChosenProduct ? (bottomChosenVariant?.sku || bottomChosenProduct.sku) : "—"}
                    </span>
                  </td>

                  <td className="px-4 py-2.5">
                    {bottomVariants.length > 0 ? (
                      <div className="space-y-1">
                        <div className="relative min-w-[130px]">
                          <select
                            value={bottomVariantToAdd}
                            onChange={(e) => setBottomVariantToAdd(e.target.value)}
                            className="appearance-none w-full pl-2.5 pr-7 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-900 focus:outline-none focus:border-emerald-500 cursor-pointer transition-all"
                          >
                            <option value="">— Weight —</option>
                            {bottomVariants.map((v) => {
                              const vLabel = v.name || `${v.weight}${v.weightUnit || "kg"}`;
                              const vPrice = resolveUnitPrice(bottomChosenProduct, v);
                              return <option key={v.id} value={v.id}>{vLabel} · {formatPrice(vPrice, currencyCode, currencySymbol)}</option>;
                            })}
                          </select>
                          <ChevronDown className="w-3 h-3 text-emerald-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {bottomVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => { handleAddAllVariants(bottomChosenProduct, bottomQuantity); setBottomProductToAdd(""); setBottomVariantToAdd(""); }}
                            className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer underline-offset-2 hover:underline"
                          >
                            + All {bottomVariants.length} weights
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 italic">{bottomChosenProduct ? "Standard" : "—"}</span>
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-right">
                    <input
                      type="number"
                      min="1"
                      value={bottomQuantity}
                      onChange={(e) => setBottomQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20 px-2 py-1.5 text-sm font-bold text-center rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </td>

                  <td className="px-4 py-2.5 text-right">
                    <span className="text-xs font-mono text-slate-400">
                      {bottomChosenProduct ? formatPrice(bottomUnitPrice, currencyCode, currencySymbol) : "—"}
                    </span>
                  </td>

                  <td className="px-4 py-2.5 text-right">
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {bottomChosenProduct ? formatPrice(bottomUnitPrice * bottomQuantity, currencyCode, currencySymbol) : "—"}
                    </span>
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={handleBottomAdd}
                      disabled={!bottomProductToAdd}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                      title="Add row"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer: Notes + Summary */}
          <div className="border-t border-slate-100">
            {/* Notes */}
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  PO Reference / Tracking #
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-VANOM-0089"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Special Handling Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hydraulic liftgate required at delivery dock"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Summary Bar */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5 text-xs">
                <div>
                  <span className="text-slate-400">Lines</span>
                  <span className="ml-1.5 font-bold text-slate-800">{rows.length}</span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-400">Units</span>
                  <span className="ml-1.5 font-bold text-slate-800">{totalUnits.toLocaleString()}</span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-400">Country</span>
                  <span className="ml-1.5 font-bold text-slate-800">{targetCountryCode} · {currencyCode}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subtotal</div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight font-mono leading-none mt-0.5">
                    {formatPrice(totalSubtotal, currencyCode, currencySymbol)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => submitOrderMutation.mutate()}
                  disabled={rows.length === 0 || submitOrderMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  {submitOrderMutation.isPending ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />Submitting…</>
                  ) : (
                    <><Send className="w-4 h-4" />Submit Order</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BulkOrder;
