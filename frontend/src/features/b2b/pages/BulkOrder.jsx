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
  Building2,
  RefreshCw,
  Search,
  Scale
} from "lucide-react";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";

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

  // Load Verified Private B2B Products
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
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("");
  const [selectedVariantToAdd, setSelectedVariantToAdd] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");

  // Live Order Lines: Product + Weight Variant combinations
  const [rows, setRows] = useState([]);

  // Resolve active variants for the currently selected product in dropdown
  const currentChosenProduct = bulkProducts.find((p) => p.id === selectedProductToAdd);
  const currentProductVariants = Array.isArray(currentChosenProduct?.variants)
    ? currentChosenProduct.variants.filter((v) => v.isActive !== false)
    : [];

  // Filtered bulk products for selector
  const availableBulkProducts = bulkProducts.filter((p) => {
    if (selectedCategory !== "ALL") {
      const matchedCat = categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory);
      const catId = matchedCat?.id || selectedCategory;
      const catName = (matchedCat?.name || selectedCategory).toLowerCase();
      const prodCat = (p.category || p.categoryName || "").toLowerCase();
      const prodCatId = p.categoryId;

      const matchesCat = prodCatId === catId || prodCat === catName || prodCat.includes(catName);
      if (!matchesCat) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle URL query pre-population
  useEffect(() => {
    if (requestedProductId && bulkProducts.length > 0) {
      const prod = bulkProducts.find((p) => p.id === requestedProductId);
      if (prod) {
        const variant = requestedVariantId
          ? prod.variants?.find((v) => v.id === requestedVariantId)
          : prod.variants?.[0];

        const initialQty = requestedQty ? Math.max(1, parseInt(requestedQty, 10)) : 10;
        handleAddLine(prod, variant, initialQty);
      }
    }
  }, [requestedProductId, requestedVariantId, requestedQty, bulkProducts]);

  // Helper to resolve unit price for a variant under the current country
  function resolveUnitPrice(prod, variant) {
    if (variant) {
      const cp = variant.countryPrices?.find((p) => p.countryCode?.toUpperCase() === targetCountryCode);
      if (cp && cp.unitPrice !== undefined && cp.unitPrice !== null) {
        return Number(cp.unitPrice);
      }
      if (cp?.tiers?.[0]?.price) return Number(cp.tiers[0].price);
    }
    // Fallback to product level
    const cp = prod.countryPrices?.find((p) => p.countryCode?.toUpperCase() === targetCountryCode);
    if (cp && cp.unitPrice !== undefined) return Number(cp.unitPrice);
    return Number(prod.basePriceUSD || 0);
  }

  const handleAddLine = (prod, variant = null, initialQuantity = 10) => {
    const variantId = variant?.id || null;
    const rowKey = `${prod.id}_${variantId || "default"}`;

    const existingIndex = rows.findIndex((r) => r.rowKey === rowKey);
    if (existingIndex >= 0) {
      // Increment quantity
      const newRows = [...rows];
      newRows[existingIndex].quantity += initialQuantity;
      setRows(newRows);
      toast.info("Quantity Updated", `Increased quantity for ${prod.name} (${newRows[existingIndex].weightLabel}).`);
      return;
    }

    const unitPrice = resolveUnitPrice(prod, variant);
    const weightLabel = variant?.name || (variant?.weight ? `${variant.weight}${variant.weightUnit || "kg"}` : "Standard");
    const sku = variant?.sku || prod.sku;

    const newRow = {
      rowKey,
      productId: prod.id,
      variantId,
      name: prod.name,
      description: prod.description || "",
      sku,
      imageUrl: resolveProductImageUrl(prod),
      weight: variant?.weight ?? null,
      weightUnit: variant?.weightUnit || "kg",
      weightLabel,
      quantity: initialQuantity,
      unitPrice,
      currencyCode,
      countryCode: targetCountryCode
    };

    setRows((prev) => [...prev, newRow]);
    toast.success("Added to Order", `Added ${prod.name} - ${weightLabel} at ${formatPrice(unitPrice, currencyCode, currencySymbol)}.`);
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

  const handleQuantityChange = (index, qty) => {
    const newRows = [...rows];
    const targetQty = Math.max(1, parseInt(qty, 10) || 1);
    newRows[index].quantity = targetQty;
    setRows(newRows);
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
    const headers = "SKU,Product_Name,Weight,Quantity,Unit_Price,Currency,Line_Total\n";
    const body = rows
      .map(
        (r) =>
          `"${r.sku}","${r.name.replace(/"/g, '""')}","${r.weightLabel}",${r.quantity},${r.unitPrice},"${r.currencyCode}",${(r.unitPrice * r.quantity).toFixed(2)}`
      )
      .join("\n");
    const blob = new Blob([headers + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VANOM_B2B_Order_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported", "Downloaded your wholesale order matrix CSV.");
  };

  // Submit Mutation
  const submitOrderMutation = useMutation({
    mutationFn: async () => {
      const company = user?.companyMembers?.[0]?.company;
      const contactPerson = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Wholesale Procurement Manager";

      const payload = {
        countryCode: targetCountryCode,
        shippingCharges: 0,
        tax: 0,
        notes: notes || "Wholesale Purchase Order dispatch",
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
          countryCode: targetCountryCode,
        },
      };
      return Api.b2b.createBulkOrder(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["b2b-bulk-orders-list"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-orders"] });
      toast.success(
        "Wholesale Order Placed Successfully!",
        `Order ${data?.orderNumber || "PO"} has been recorded into the wholesale system.`
      );
      navigate(ROUTES.B2B.ORDERS);
    },
    onError: (err) => {
      toast.error("Submission Failed", err.message || "Failed to submit wholesale order.");
    },
  });

  const totalUnits = rows.reduce((sum, r) => sum + r.quantity, 0);
  const totalSubtotal = rows.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-bold text-emerald-700 uppercase tracking-wider">B2B Wholesale Portal</span>
            <span>•</span>
            <span className="text-slate-600">Wholesale Order Matrix ({targetCountryCode})</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Wholesale Bulk Order Matrix & Spreadsheet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build your purchase order line-by-line with dynamic weight options and independent country pricing.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Export CSV
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

      {/* Quick Add Product & Weight Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Add Product & Weight Variant</h4>
            <p className="text-[11px] text-slate-500">Each weight variant is added as an independent line item.</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#006B3C] cursor-pointer min-w-[150px]"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Product Dropdown */}
          <select
            value={selectedProductToAdd}
            onChange={(e) => {
              setSelectedProductToAdd(e.target.value);
              setSelectedVariantToAdd("");
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#006B3C] cursor-pointer min-w-[240px]"
          >
            <option value="">-- Choose Wholesale Product --</option>
            {availableBulkProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          {/* Weight Variant Dropdown (if product has variants) */}
          {currentProductVariants.length > 0 && (
            <select
              value={selectedVariantToAdd}
              onChange={(e) => setSelectedVariantToAdd(e.target.value)}
              className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold focus:outline-none focus:border-[#006B3C] cursor-pointer min-w-[160px]"
            >
              <option value="">-- Choose Weight --</option>
              {currentProductVariants.map((v) => {
                const label = v.name || `${v.weight}${v.weightUnit || "kg"}`;
                const price = resolveUnitPrice(currentChosenProduct, v);
                return (
                  <option key={v.id} value={v.id}>
                    {label} — {formatPrice(price, currencyCode, currencySymbol)}
                  </option>
                );
              })}
            </select>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleAddChosenProduct}
            disabled={!selectedProductToAdd}
            className="font-bold cursor-pointer"
          >
            Add Line
          </Button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Wholesale Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Weight Variant</th>
                <th className="p-4">Order Quantity</th>
                <th className="p-4">Country Unit Price ({currencyCode})</th>
                <th className="p-4">Line Total ({currencyCode})</th>
                <th className="p-4 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">Spreadsheet is empty</p>
                    <p className="text-xs text-slate-500 mt-1">Select a wholesale product and weight variant above to begin building your purchase order.</p>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const lineTotal = row.unitPrice * row.quantity;

                  return (
                    <tr key={row.rowKey || idx} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Title & Thumbnail */}
                      <td className="p-4 font-bold text-slate-900 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={row.imageUrl || FALLBACK_PRODUCT_IMAGE}
                            alt={row.name}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50 shadow-2xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                          <div>
                            <div className="leading-snug text-sm">{row.name}</div>
                            <span className="text-[10px] text-slate-400 font-normal">Direct Wholesale Line</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-4 font-mono text-slate-600 font-bold">{row.sku}</td>

                      {/* Weight Variant Pill */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 inline-flex items-center gap-1 font-mono">
                          <Scale className="w-3 h-3" />
                          {row.weightLabel}
                        </span>
                      </td>

                      {/* Quantity Input */}
                      <td className="p-4">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          className="w-24 p-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold text-center focus:border-[#006B3C] focus:outline-none transition-all"
                        />
                      </td>

                      {/* Country Unit Price */}
                      <td className="p-4 font-bold text-slate-900 text-sm font-mono">
                        {formatPrice(row.unitPrice, currencyCode, currencySymbol)}
                      </td>

                      {/* Line Subtotal */}
                      <td className="p-4 font-black text-slate-900 text-base font-mono">
                        {formatPrice(lineTotal, currencyCode, currencySymbol)}
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

        {/* PO Reference & Tracking # */}
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
              Special Handling Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Hydraulic liftgate required at delivery dock"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#006B3C]"
            />
          </div>
        </div>

        {/* Footer Summary & Order Dispatch */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-xs text-slate-600">
            <div>
              <span>Product Lines: <strong className="text-slate-900">{rows.length}</strong></span> •{" "}
              <span>Total Units: <strong className="text-emerald-700">{totalUnits.toLocaleString()} Units</strong></span>
            </div>
            <p className="text-[11px] text-slate-400">
              Country Pricing: <strong>{targetCountryCode}</strong> ({currencyCode}) • Unit Price × Quantity = Line Total
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block uppercase font-semibold">Wholesale Subtotal</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatPrice(totalSubtotal, currencyCode, currencySymbol)}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => submitOrderMutation.mutate()}
              disabled={rows.length === 0 || submitOrderMutation.isPending}
              isLoading={submitOrderMutation.isPending}
              className="font-bold shadow-sm cursor-pointer px-6 bg-emerald-700 hover:bg-emerald-600 text-white"
              icon={FileSpreadsheet}
            >
              Submit Wholesale Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkOrder;
