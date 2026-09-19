import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  Search,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";

export function BulkOrder() {
  const [searchParams] = useSearchParams();
  const requestedProductId = searchParams.get("productId");

  const { country } = useCountryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load Verified Private B2B Products from separate /bulk-products endpoint
  const { data: bulkProducts = [], isLoading: loadingProducts, refetch } = useQuery({
    queryKey: ["b2b-bulk-products"],
    queryFn: () => Api.b2b.getBulkProducts(),
  });

  // Load shared Master Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["shared-categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");

  // Live Spreadsheet Table Rows (Starts empty by default for manual selection)
  const [rows, setRows] = useState([]);

  // Filtered bulk products for selector
  const availableBulkProducts = bulkProducts.filter((p) => {
    if (selectedCategory !== "ALL" && p.categoryId !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  // Only auto-add if a specific product was requested via URL query params (e.g. from Catalog)
  useEffect(() => {
    if (requestedProductId && bulkProducts.length > 0) {
      const exists = rows.some((r) => r.productId === requestedProductId);
      if (!exists) {
        handleAddProductToSheet(requestedProductId);
      }
    }
  }, [requestedProductId, bulkProducts]);

  // Resolve user company id
  useEffect(() => {
    if (user?.companyMembers?.[0]?.companyId) {
      setSelectedCompanyId(user.companyMembers[0].companyId);
    }
  }, [user]);

  function resolveCountryConfig(prod, countryCode) {
    if (!prod) return null;
    const targetCode = (countryCode || country.code || "US").toUpperCase();
    if (Array.isArray(prod.countryPrices) && prod.countryPrices.length > 0) {
      const match = prod.countryPrices.find(
        (cp) => cp.countryCode?.toUpperCase() === targetCode && cp.isAvailable !== false
      );
      if (match) return match;
      const fallback = prod.countryPrices.find((cp) => cp.isAvailable !== false);
      if (fallback) return fallback;
    }
    return null;
  }

  function resolveTier(tiers, qty) {
    if (!tiers || tiers.length === 0) return null;
    const sorted = [...tiers].sort((a, b) => (b.minQuantity || 0) - (a.minQuantity || 0));
    const match = sorted.find((t) => qty >= (t.minQuantity || 1));
    return match || sorted[sorted.length - 1];
  }

  const handleQuantityChange = (index, qty) => {
    const newRows = [...rows];
    const targetQty = Math.max(1, parseInt(qty, 10) || 1);
    const item = newRows[index];
    const matchedTier = resolveTier(item.tiers, targetQty);
    const unitPrice = matchedTier ? Number(matchedTier.price) : Number(item.basePrice || item.unitPrice || 0);

    newRows[index] = {
      ...item,
      quantity: targetQty,
      unitPrice,
      matchedTierIndex: matchedTier ? item.tiers.findIndex((t) => t.minQuantity === matchedTier.minQuantity) : 0,
      discountPercent: item.basePrice && unitPrice < item.basePrice
        ? Math.round(((item.basePrice - unitPrice) / item.basePrice) * 100)
        : 0,
    };
    setRows(newRows);
  };

  const handleAddProductToSheet = (prodId) => {
    const prod = bulkProducts.find((p) => p.id === prodId);
    if (!prod) return;

    if (rows.some((r) => r.productId === prod.id)) {
      toast.info("Already in Matrix", `"${prod.name}" is already in your bulk spreadsheet.`);
      return;
    }

    const countryConfig = resolveCountryConfig(prod, country.code);
    const tiers = Array.isArray(countryConfig?.tiers) && countryConfig.tiers.length > 0
      ? countryConfig.tiers
      : Array.isArray(prod.wholesaleTiers)
      ? prod.wholesaleTiers.map((t) => ({
          minQuantity: t.minQuantity,
          maxQuantity: t.maxQuantity,
          price: country.currency === "CAD" ? t.unitPriceCAD : t.unitPriceUSD || 30.0,
        }))
      : [];

    const moq = countryConfig?.moq || prod.moq || 20;
    const initialQty = moq;
    const basePrice = tiers[0]?.price || (country.currency === "CAD" ? prod.basePriceCAD : country.currency === "INR" ? prod.basePriceINR : prod.basePriceUSD) || 30.0;
    const matchedTier = resolveTier(tiers, initialQty);
    const unitPrice = matchedTier ? Number(matchedTier.price) : Number(basePrice);

    const newRow = {
      id: prod.id,
      productId: prod.id,
      variantId: null,
      name: prod.name,
      sku: prod.sku,
      categoryName: prod.categoryName || "General",
      packaging: prod.packaging?.type || "25 KG Poly Sacks",
      unitsPerPackage: prod.packaging?.unitsPerPackage || 1,
      packagesPerPallet: prod.packaging?.packagesPerPallet || 40,
      palletCapacityUnits: prod.packaging?.palletCapacityUnits || 1000,
      currencyCode: countryConfig?.currencyCode || country.currency || "USD",
      stock: countryConfig?.stock !== undefined ? countryConfig.stock : prod.stockQuantity || 1000,
      moq: moq,
      quantity: initialQty,
      basePrice: Number(basePrice),
      unitPrice: Number(unitPrice),
      tiers: tiers,
      matchedTierIndex: matchedTier ? tiers.findIndex((t) => t.minQuantity === matchedTier.minQuantity) : 0,
      discountPercent: basePrice && unitPrice < basePrice
        ? Math.round(((basePrice - unitPrice) / basePrice) * 100)
        : 0,
    };

    setRows([...rows, newRow]);
    setSelectedProductToAdd("");
    toast.success("Product Added", `Added ${prod.name} (MOQ: ${moq}) to bulk order matrix.`);
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // CSV Template Export
  const handleExportCSV = () => {
    if (rows.length === 0) {
      toast.error("Empty Sheet", "Please add products before exporting template.");
      return;
    }
    const headers = "SKU,Product_Name,Category,Packaging,MOQ,Quantity,Tier_Unit_Price,Line_Subtotal\n";
    const body = rows
      .map(
        (r) =>
          `"${r.sku}","${r.name.replace(/"/g, '""')}","${r.categoryName || ""}",${r.packaging},${r.moq},${r.quantity},${r.unitPrice},${(r.unitPrice * r.quantity).toFixed(2)}`
      )
      .join("\n");
    const blob = new Blob([headers + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VANOM_B2B_Bulk_Order_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported", "Downloaded your bulk order matrix CSV.");
  };

  // CSV Import simulation
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        toast.success("CSV Imported", `Loaded order line specifications from ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Submit Mutation
  const submitOrderMutation = useMutation({
    mutationFn: async () => {
      const company = user?.companyMembers?.[0]?.company;
      const contactPerson = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Bulk Procurement Manager";

      const payload = {
        countryCode: country.code || "IN",
        shippingCharges: 0,
        tax: 0,
        notes: notes || "B2B Bulk Purchase Order dispatch",
        items: rows.map((r) => ({
          productId: r.productId,
          variantId: r.variantId,
          quantity: r.quantity,
          unitPrice: r.unitPrice,
        })),
        shippingAddress: {
          contactName: contactPerson,
          phone: user?.phone || "+1-555-0199",
          addressLine1: typeof company?.address === "string" ? company.address : "Corporate Fulfillment Hub",
          city: company?.city || "Procurement HQ",
          state: company?.state || "State/Province",
          postalCode: company?.postalCode || "00000",
          countryCode: country.code || "IN",
        },
      };
      return Api.b2b.createBulkOrder(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["b2b-bulk-orders-list"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-orders"] });
      toast.success(
        "Bulk Order Placed Successfully!",
        `Order ${data?.orderNumber || "PO"} has been recorded into the wholesale system.`
      );
      navigate(ROUTES.B2B.ORDERS);
    },
    onError: (err) => {
      toast.error("Submission Failed", err.message || "Failed to submit bulk order.");
    },
  });

  const totalUnits = rows.reduce((sum, r) => sum + r.quantity, 0);
  const totalSubtotal = rows.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);
  const hasMoqViolations = rows.some((r) => r.quantity < r.moq);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-bold text-emerald-700 uppercase tracking-wider">Private B2B Wholesale Portal</span>
            <span>•</span>
            <span className="text-slate-600">Dedicated Bulk Ordering Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Enterprise Bulk Order Matrix & Spreadsheet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            High-volume wholesale pricing, pallet specifications, and tiered quantity discount calculator.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <label className="cursor-pointer">
            <input type="file" accept=".csv,.xlsx" onChange={handleCSVUpload} className="hidden" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Upload}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Import CSV
            </Button>
          </label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Export Sheet
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetch()}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Add Product Bar with Category Filter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Add Bulk SKU to Matrix</h4>
            <p className="text-[11px] text-slate-500">Filter by category and select private wholesale products.</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Shared Category Filter Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#006B3C] cursor-pointer min-w-[160px]"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Product Dropdown filtered by category */}
          <select
            value={selectedProductToAdd}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedProductToAdd(val);
              if (val) handleAddProductToSheet(val);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#006B3C] cursor-pointer min-w-[280px]"
          >
            <option value="">-- Choose Private Wholesale Product --</option>
            {availableBulkProducts.map((p) => (
              <option key={p.id} value={p.id} disabled={rows.some((r) => r.id === p.id)}>
                {p.name} ({p.sku}) • MOQ: {p.moq}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Bulk Product Line</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Packaging & Pallet Spec</th>
                <th className="p-4">Order Quantity (Units)</th>
                <th className="p-4">Applied Tier Discount</th>
                <th className="p-4">Wholesale Unit Price</th>
                <th className="p-4">Line Subtotal</th>
                <th className="p-4 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-400">
                    <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">Spreadsheet is empty</p>
                    <p className="text-xs text-slate-500 mt-1">Select a product from the dropdown above to begin building your bulk purchase order.</p>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const isMoqMet = row.quantity >= row.moq;
                  const lineTotal = row.unitPrice * row.quantity;

                  return (
                    <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Title */}
                      <td className="p-4 font-bold text-slate-900 max-w-xs">
                        <div className="leading-snug">{row.name}</div>
                        <span className="text-[10px] text-slate-400 font-normal">Verified B2B Direct Batch</span>
                      </td>

                      {/* SKU */}
                      <td className="p-4 font-mono text-slate-600 font-bold">{row.sku}</td>

                      {/* Packaging */}
                      <td className="p-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium border border-slate-200 text-slate-700">
                          {row.packaging}
                        </span>
                      </td>

                      {/* Quantity Input with MOQ Warning */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleQuantityChange(idx, e.target.value)}
                            className={`w-24 p-2 rounded-xl border text-sm font-bold text-center focus:outline-none transition-all ${
                              isMoqMet
                                ? "bg-white border-slate-300 text-slate-900 focus:border-[#006B3C]"
                                : "bg-red-50 border-red-300 text-red-700"
                            }`}
                          />
                          {!isMoqMet ? (
                            <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              Min MOQ: {row.moq}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              MOQ Met ({row.moq}+)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Applied Tier */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-800 text-xs px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                              Tier #{(row.matchedTierIndex ?? 0) + 1}
                            </span>
                            {row.discountPercent > 0 && (
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {row.discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Tier quantity breakdown hints */}
                          {row.tiers && row.tiers.length > 1 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              {row.tiers.map((t, tIdx) => {
                                const isCurrent = tIdx === (row.matchedTierIndex ?? 0);
                                return (
                                  <span
                                    key={tIdx}
                                    title={`${t.minQuantity}${t.maxQuantity ? `-${t.maxQuantity}` : '+'} units: ${formatPrice(t.price, country.currency, country.symbol)}`}
                                    className={`text-[9px] px-1.5 py-0.2 rounded border transition-colors ${
                                      isCurrent
                                        ? "bg-emerald-600 text-white font-bold border-emerald-700 shadow-2xs"
                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                    }`}
                                  >
                                    {t.minQuantity}+
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Wholesale Unit Price */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm font-mono">
                            {formatPrice(row.unitPrice, country.currency, country.symbol)}
                          </span>
                          {row.basePrice && row.unitPrice < row.basePrice && (
                            <span className="text-[10px] text-slate-400 line-through font-mono">
                              {formatPrice(row.basePrice, country.currency, country.symbol)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Line Subtotal */}
                      <td className="p-4 font-black text-slate-900 text-base font-mono">
                        {formatPrice(lineTotal, country.currency, country.symbol)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Order Specifications & Notes */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Purchase Order (PO) Reference / Internal Tracking #
            </label>
            <input
              type="text"
              placeholder="e.g. PO-2026-VANOM-0089"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#006B3C] font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Procurement & Delivery Requirements (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Requires hydraulic liftgate at unloading dock, deliver before 2 PM"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#006B3C]"
            />
          </div>
        </div>

        {/* Footer Summary & Order Dispatch */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-xs text-slate-600">
            <div>
              <span>Active Product Lines: <strong className="text-slate-900">{rows.length}</strong></span> •{" "}
              <span>Total Volume: <strong className="text-emerald-700">{totalUnits.toLocaleString()} Units</strong></span>
            </div>
            {hasMoqViolations && (
              <div className="text-red-600 font-semibold flex items-center gap-1.5 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>One or more products do not meet the Minimum Order Quantity (MOQ).</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block uppercase font-semibold">Estimated Wholesale Total</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatPrice(totalSubtotal, country.currency, country.symbol)}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => submitOrderMutation.mutate()}
              disabled={rows.length === 0 || hasMoqViolations || submitOrderMutation.isPending}
              isLoading={submitOrderMutation.isPending}
              className="font-bold shadow-sm cursor-pointer px-6"
              icon={FileSpreadsheet}
            >
              Submit Bulk Purchase Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkOrder;
