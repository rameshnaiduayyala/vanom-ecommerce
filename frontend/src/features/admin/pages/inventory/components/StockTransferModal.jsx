import React, { useState } from "react";
import { X, ArrowRightLeft, Warehouse, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

export function StockTransferModal({
  isOpen,
  onClose,
  warehouses = [],
  inventoryItems = [],
  onSubmit,
  isPending = false,
}) {
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("");
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  // Filter items available at the chosen source warehouse
  const sourceItems = sourceWarehouseId
    ? inventoryItems.filter((i) => i.warehouseId === sourceWarehouseId)
    : inventoryItems;

  const currentItem = sourceItems.find((i) => i.id === selectedInventoryId);
  const availableQty = currentItem
    ? Math.max(0, (currentItem.quantity || currentItem.stock || 0) - (currentItem.reservedQuantity || currentItem.reserved || 0))
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sourceWarehouseId || !destinationWarehouseId) return;
    if (sourceWarehouseId === destinationWarehouseId) return;
    if (!selectedInventoryId || quantity <= 0 || quantity > availableQty) return;

    onSubmit({
      sourceWarehouseId,
      destinationWarehouseId,
      notes: notes || "Inter-warehouse stock transfer",
      items: [
        {
          inventoryId: selectedInventoryId,
          quantity: Number(quantity),
        },
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Warehouse Stock Transfer</h2>
              <p className="text-xs text-text-muted">Atomic transfer between warehouses with dual-ledger audit</p>
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
          <div className="grid grid-cols-2 gap-3">
            {/* Source Warehouse */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 flex items-center gap-1">
                <Warehouse className="w-3.5 h-3.5 text-amber-600" /> Source Warehouse
              </label>
              <select
                value={sourceWarehouseId}
                onChange={(e) => {
                  setSourceWarehouseId(e.target.value);
                  setSelectedInventoryId("");
                }}
                required
                className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 focus:border-[#00875A] focus:outline-none"
              >
                <option value="">-- Choose Origin --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id} disabled={w.id === destinationWarehouseId}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Warehouse */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 flex items-center gap-1">
                <Warehouse className="w-3.5 h-3.5 text-emerald-600" /> Destination Warehouse
              </label>
              <select
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 focus:border-[#00875A] focus:outline-none"
              >
                <option value="">-- Choose Target --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id} disabled={w.id === sourceWarehouseId}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sourceWarehouseId === destinationWarehouseId && sourceWarehouseId !== "" && (
            <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> Source and destination warehouses must be different.
            </p>
          )}

          {/* Product / Inventory Item Selection */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> Item to Transfer
            </label>
            <select
              value={selectedInventoryId}
              onChange={(e) => {
                setSelectedInventoryId(e.target.value);
                setQuantity(1);
              }}
              required
              disabled={!sourceWarehouseId}
              className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 focus:border-[#00875A] focus:outline-none disabled:bg-surface-muted"
            >
              <option value="">{sourceWarehouseId ? "-- Select Item --" : "Select source warehouse first"}</option>
              {sourceItems.map((item) => {
                const prodName = item.product?.name || item.name || "Item";
                const varName = item.variant?.name ? ` [${item.variant.name}]` : "";
                const sku = item.variant?.sku || item.product?.sku || item.sku || "SKU";
                const avail = Math.max(0, (item.quantity || 0) - (item.reservedQuantity || 0));
                return (
                  <option key={item.id} value={item.id}>
                    {prodName}{varName} ({sku}) - Avail: {avail} units
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity & Available warning */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">
                Transfer Quantity (Units)
              </label>
              {currentItem && (
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  Max Available: {availableQty} units
                </span>
              )}
            </div>
            <input
              type="number"
              min="1"
              max={availableQty || 1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              disabled={!selectedInventoryId || availableQty <= 0}
              className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 font-bold text-slate-900 focus:border-[#00875A] focus:outline-none disabled:bg-surface-muted"
            />
            {quantity > availableQty && (
              <p className="text-[11px] text-red-600 mt-1">
                Transfer quantity cannot exceed available stock ({availableQty}).
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Transfer Manifest / Dispatch Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Express courier dispatch, vehicle KA-04-1234"
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
              disabled={
                isPending ||
                !sourceWarehouseId ||
                !destinationWarehouseId ||
                sourceWarehouseId === destinationWarehouseId ||
                !selectedInventoryId ||
                quantity <= 0 ||
                quantity > availableQty
              }
              className="font-bold bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Executing Transfer..." : "Execute Atomic Transfer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
