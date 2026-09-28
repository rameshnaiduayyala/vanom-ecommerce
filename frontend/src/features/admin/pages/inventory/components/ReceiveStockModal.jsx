import React, { useState, useEffect, useMemo } from "react";
import { X, ArrowDownToLine, Warehouse, Package, Truck, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

export function ReceiveStockModal({
  isOpen,
  onClose,
  warehouses = [],
  inventoryItems = [],
  catalogItems = [],
  initialTarget = null,
  onSubmit,
  isPending = false,
}) {
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [supplier, setSupplier] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Normalize list of selectable products and variants
  const selectables = useMemo(() => {
    if (catalogItems && catalogItems.length > 0) {
      return catalogItems;
    }
    if (inventoryItems && inventoryItems.length > 0) {
      return inventoryItems.map((item) => {
        const prod = item.product || item;
        const variant = item.variant;
        return {
          id: item.id,
          productId: prod.id || item.productId,
          variantId: variant?.id || item.variantId || null,
          name: variant?.name ? `${prod.name} - ${variant.name}` : prod.name,
          sku: variant?.sku || prod.sku || item.sku || "SKU-STD",
          productName: prod.name,
          currentStock: item.quantity !== undefined ? item.quantity : (item.stock || 0),
          warehouseId: item.warehouseId,
          warehouseCode: item.warehouse?.code,
          type: variant ? "VARIANT" : "SIMPLE",
        };
      });
    }
    return [];
  }, [catalogItems, inventoryItems]);

  // Set default warehouse and initial pre-selected item
  useEffect(() => {
    if (isOpen) {
      if (warehouses.length > 0 && !warehouseId) {
        setWarehouseId(warehouses[0].id);
      }

      if (initialTarget) {
        const matched = selectables.find(
          (s) =>
            s.id === initialTarget.id ||
            s.productId === initialTarget.productId ||
            (initialTarget.variantId && s.variantId === initialTarget.variantId)
        );
        if (matched) {
          setSelectedKey(matched.id || `${matched.productId}_${matched.variantId || "simple"}`);
        }
      } else if (selectables.length > 0 && !selectedKey) {
        const first = selectables[0];
        setSelectedKey(first.id || `${first.productId}_${first.variantId || "simple"}`);
      }
    }
  }, [isOpen, initialTarget, selectables, warehouses]);

  if (!isOpen) return null;

  // Filtered dropdown list based on search input
  const filteredSelectables = selectables.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      (item.productName && item.productName.toLowerCase().includes(q))
    );
  });

  const selectedItem = selectables.find(
    (s) => (s.id || `${s.productId}_${s.variantId || "simple"}`) === selectedKey
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) return;
    if (!selectedItem) return;

    const targetWarehouseId = warehouseId || selectedItem.warehouseId || warehouses[0]?.id;

    onSubmit({
      warehouseId: targetWarehouseId,
      productId: selectedItem.productId,
      variantId: selectedItem.variantId || null,
      quantity: Number(quantity),
      supplier: supplier || undefined,
      referenceNumber: referenceNumber || undefined,
      notes: notes || "Stock received via Admin Dashboard",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00875A] flex items-center justify-center border border-emerald-200">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Receive Stock (Purchase Inward)</h2>
              <p className="text-xs text-text-muted">Inward new stock units directly into a warehouse depot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Warehouse Selection */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 flex items-center gap-1">
              <Warehouse className="w-3.5 h-3.5 text-purple-600" /> Destination Warehouse Depot *
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              required
              className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 focus:border-[#00875A] focus:outline-none"
            >
              <option value="">-- Choose Warehouse Depot --</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name} ({w.city || w.country})
                </option>
              ))}
            </select>
          </div>

          {/* Product / Variant Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary uppercase flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-emerald-600" /> Product / Variant *
              </label>
              <span className="text-[11px] text-text-muted">
                {selectables.length} catalog items available
              </span>
            </div>

            {/* Quick Filter Search inside modal */}
            {selectables.length > 5 && (
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border pl-8 pr-3 py-1.5 bg-surface-muted/50 focus:border-[#00875A] focus:outline-none"
                />
              </div>
            )}

            <select
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                const chosen = selectables.find(
                  (s) => (s.id || `${s.productId}_${s.variantId || "simple"}`) === e.target.value
                );
                if (chosen?.warehouseId && !warehouseId) {
                  setWarehouseId(chosen.warehouseId);
                }
              }}
              required
              className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 focus:border-[#00875A] focus:outline-none"
            >
              <option value="">-- Choose Product or Variant to Inward --</option>
              {filteredSelectables.map((item) => {
                const key = item.id || `${item.productId}_${item.variantId || "simple"}`;
                const whTag = item.warehouseCode ? ` [${item.warehouseCode}]` : "";
                return (
                  <option key={key} value={key}>
                    {item.name} | SKU: {item.sku}{whTag} (Current Stock: {item.currentStock ?? 0})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Received Quantity (Units) *
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 font-bold text-slate-900 focus:border-[#00875A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Supplier */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> Supplier / Vendor
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Himalayan Farms Ltd"
                className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
              />
            </div>

            {/* PO / Reference */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> PO / Inward Ref #
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. PO-2026-9812"
                className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Receiving Notes / Inspection remarks
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Batch #B492 received in perfect sealed condition"
              className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending || !selectedItem || !quantity || !warehouseId}
              className="font-bold bg-[#00875A] hover:bg-[#00704A]"
            >
              {isPending ? "Receiving..." : "Confirm & Inward Stock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReceiveStockModal;
