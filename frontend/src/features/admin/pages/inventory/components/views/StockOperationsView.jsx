import React, { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRightLeft,
  Sliders,
  Warehouse,
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

export function StockOperationsView({
  warehouses = [],
  inventoryItems = [],
  catalogItems = [],
  allVariants = [],
  onReceiveSubmit,
  onTransferSubmit,
  onAdjustSubmit,
  isPending = false,
}) {
  const [operationMode, setOperationMode] = useState("receive"); // receive | transfer | adjust

  // Form states for Inward
  const [inwardWarehouseId, setInwardWarehouseId] = useState(warehouses[0]?.id || "");
  const [inwardKey, setInwardKey] = useState("");
  const [inwardQuantity, setInwardQuantity] = useState(10);
  const [inwardSupplier, setInwardSupplier] = useState("");
  const [inwardReference, setInwardReference] = useState("");
  const [inwardNotes, setInwardNotes] = useState("");

  // Form states for Transfer
  const [transferSourceWh, setTransferSourceWh] = useState(warehouses[0]?.id || "");
  const [transferDestWh, setTransferDestWh] = useState(warehouses[1]?.id || "");
  const [transferInventoryId, setTransferInventoryId] = useState("");
  const [transferQuantity, setTransferQuantity] = useState(1);
  const [transferNotes, setTransferNotes] = useState("");

  // Form states for Adjust
  const [adjustTargetId, setAdjustTargetId] = useState(allVariants[0]?.id || "");
  const [adjustType, setAdjustType] = useState("SET"); // SET | ADD | SUBTRACT
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustReason, setAdjustReason] = useState("CYCLE_COUNT");
  const [adjustNotes, setAdjustNotes] = useState("");

  // Selectable items for Inward
  const selectables = catalogItems.length > 0 ? catalogItems : inventoryItems.map((item) => {
    const prod = item.product || item;
    const variant = item.variant;
    return {
      id: item.id,
      productId: prod.id || item.productId,
      variantId: variant?.id || item.variantId || null,
      name: variant?.name ? `${prod.name} - ${variant.name}` : prod.name,
      sku: variant?.sku || prod.sku || item.sku || "SKU-STD",
      currentStock: item.quantity !== undefined ? item.quantity : (item.stock || 0),
    };
  });

  const selectedInwardItem = selectables.find(
    (s) => s.id === inwardKey || `${s.productId}_${s.variantId || "simple"}` === inwardKey
  ) || selectables[0];

  // Transfer source items
  const transferSourceItems = transferSourceWh
    ? inventoryItems.filter((i) => i.warehouseId === transferSourceWh)
    : inventoryItems;

  const currentTransferItem = transferSourceItems.find((i) => i.id === transferInventoryId) || transferSourceItems[0];
  const transferAvailableQty = currentTransferItem
    ? Math.max(0, (currentTransferItem.quantity || currentTransferItem.stock || 0) - (currentTransferItem.reservedQuantity || currentTransferItem.reserved || 0))
    : 0;

  // Selected item for adjust
  const selectedAdjustVariant = allVariants.find((v) => v.id === adjustTargetId) || allVariants[0];

  // Handlers
  const handleInwardSubmit = (e) => {
    e.preventDefault();
    if (!inwardQuantity || inwardQuantity <= 0) return;
    const targetItem = selectedInwardItem;
    if (!targetItem) return;

    onReceiveSubmit({
      warehouseId: inwardWarehouseId || warehouses[0]?.id,
      productId: targetItem.productId,
      variantId: targetItem.variantId || null,
      quantity: Number(inwardQuantity),
      supplier: inwardSupplier || undefined,
      referenceNumber: inwardReference || undefined,
      notes: inwardNotes || "Standard stock intake",
    });
  };

  const handleTransferSubmitInternal = (e) => {
    e.preventDefault();
    if (!transferSourceWh || !transferDestWh) return;
    if (transferSourceWh === transferDestWh) return;
    if (!currentTransferItem || transferQuantity <= 0 || transferQuantity > transferAvailableQty) return;

    onTransferSubmit({
      sourceWarehouseId: transferSourceWh,
      destinationWarehouseId: transferDestWh,
      notes: transferNotes || "Inter-warehouse stock transfer",
      items: [
        {
          inventoryId: currentTransferItem.id,
          quantity: Number(transferQuantity),
        },
      ],
    });
  };

  const handleAdjustSubmitInternal = (e) => {
    e.preventDefault();
    if (!selectedAdjustVariant) return;

    let targetStock = Number(adjustQuantity);
    if (adjustType === "ADD") {
      targetStock = (selectedAdjustVariant.stock || 0) + Number(adjustQuantity);
    } else if (adjustType === "SUBTRACT") {
      targetStock = Math.max(0, (selectedAdjustVariant.stock || 0) - Number(adjustQuantity));
    }

    onAdjustSubmit({
      inventoryId: selectedAdjustVariant.inventoryId || selectedAdjustVariant.id,
      productId: selectedAdjustVariant.productId,
      variantId: selectedAdjustVariant.variantId || null,
      quantity: Math.max(0, targetStock),
      type: adjustReason,
      notes: adjustNotes || `Manual adjustment: ${adjustType} ${adjustQuantity} (${adjustReason})`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Mode Selectors ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setOperationMode("receive")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            operationMode === "receive"
              ? "bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500"
              : "bg-white border-border hover:bg-surface-muted/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                operationMode === "receive"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">1. Inward / Receive Stock</p>
              <p className="text-xs text-text-muted">Inbound PO shipments & new factory restocks</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setOperationMode("transfer")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            operationMode === "transfer"
              ? "bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500"
              : "bg-white border-border hover:bg-surface-muted/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                operationMode === "transfer"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">2. Inter-Depot Transfer</p>
              <p className="text-xs text-text-muted">Atomic balance transfer between warehouse hubs</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setOperationMode("adjust")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            operationMode === "adjust"
              ? "bg-amber-50/70 border-amber-500 shadow-sm ring-1 ring-amber-500"
              : "bg-white border-border hover:bg-surface-muted/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                operationMode === "adjust"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">3. Audit & Reconciliation</p>
              <p className="text-xs text-text-muted">Cycle counts, damage write-offs, shrinkage</p>
            </div>
          </div>
        </button>
      </div>

      {/* ─── Active Operations Workspace ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-2xs">
          {/* Operation 1: Receive Stock */}
          {operationMode === "receive" && (
            <form onSubmit={handleInwardSubmit} className="space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
                  Inward Stock Consignment Intake
                </h3>
                <p className="text-xs text-text-muted">
                  Log incoming inventory consignments directly into destination depot warehouses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Depot Selector */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Destination Depot Hub *
                  </label>
                  <select
                    value={inwardWarehouseId}
                    onChange={(e) => setInwardWarehouseId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-emerald-600 focus:outline-none"
                    required
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name} ({w.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product / Variant Selector */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Product / SKU *
                  </label>
                  <select
                    value={inwardKey || (selectedInwardItem?.id || "")}
                    onChange={(e) => setInwardKey(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-emerald-600 focus:outline-none"
                    required
                  >
                    {selectables.map((item) => (
                      <option
                        key={item.id || `${item.productId}_${item.variantId || "simple"}`}
                        value={item.id || `${item.productId}_${item.variantId || "simple"}`}
                      >
                        {item.name} ({item.sku}) [Current: {item.currentStock || 0}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Units to Inward *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inwardQuantity}
                    onChange={(e) => setInwardQuantity(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-emerald-600 focus:outline-none font-mono font-bold"
                    required
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Supplier / Vendor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Textiles Ltd."
                    value={inwardSupplier}
                    onChange={(e) => setInwardSupplier(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Reference Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Purchase Order / Consignment #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PO-2026-8842"
                    value={inwardReference}
                    onChange={(e) => setInwardReference(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Operational Inward Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Quality inspection passed, dock delivery A3..."
                    value={inwardNotes}
                    onChange={(e) => setInwardNotes(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-emerald-600 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  icon={ArrowDownToLine}
                  disabled={isPending}
                  className="bg-[#00875A] hover:bg-[#00744e] text-white px-6 font-bold"
                >
                  {isPending ? "Inwarding Stock..." : "Confirm Inward Stock"}
                </Button>
              </div>
            </form>
          )}

          {/* Operation 2: Stock Transfer */}
          {operationMode === "transfer" && (
            <form onSubmit={handleTransferSubmitInternal} className="space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                  Inter-Depot Stock Transfer
                </h3>
                <p className="text-xs text-text-muted">
                  Atomically reallocate physical stock balances between two registered warehouse depots.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Source Warehouse */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Source Depot (From) *
                  </label>
                  <select
                    value={transferSourceWh}
                    onChange={(e) => {
                      setTransferSourceWh(e.target.value);
                      setTransferInventoryId("");
                    }}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-blue-600 focus:outline-none"
                    required
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Warehouse */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Destination Depot (To) *
                  </label>
                  <select
                    value={transferDestWh}
                    onChange={(e) => setTransferDestWh(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-blue-600 focus:outline-none"
                    required
                  >
                    {warehouses
                      .filter((w) => w.id !== transferSourceWh)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Inventory Item to Move */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Select Product to Move *
                  </label>
                  <select
                    value={transferInventoryId || (currentTransferItem?.id || "")}
                    onChange={(e) => setTransferInventoryId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-blue-600 focus:outline-none"
                    required
                  >
                    {transferSourceItems.length === 0 ? (
                      <option value="">No items currently stored at this source depot</option>
                    ) : (
                      transferSourceItems.map((item) => {
                        const prod = item.product || item;
                        const v = item.variant;
                        const avail = Math.max(0, (item.quantity || 0) - (item.reservedQuantity || 0));
                        return (
                          <option key={item.id} value={item.id}>
                            {prod.name} {v?.name ? `(${v.name})` : ""} - Available: {avail} units
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Units to Transfer (Max: {transferAvailableQty}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={transferAvailableQty || 1}
                    value={transferQuantity}
                    onChange={(e) => setTransferQuantity(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-blue-600 focus:outline-none font-mono font-bold"
                    required
                  />
                </div>

                {/* Reason / Notes */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Transfer Purpose / Manifest #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Regional redistribution, TRF-9021"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {transferSourceWh === transferDestWh && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Source and destination depot hubs cannot be the same.</span>
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  icon={ArrowRightLeft}
                  disabled={isPending || transferSourceItems.length === 0 || transferAvailableQty <= 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-bold"
                >
                  {isPending ? "Executing Transfer..." : "Execute Atomic Transfer"}
                </Button>
              </div>
            </form>
          )}

          {/* Operation 3: Audit Adjustment */}
          {operationMode === "adjust" && (
            <form onSubmit={handleAdjustSubmitInternal} className="space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-600" />
                  Inventory Audit & Stock Reconciliation
                </h3>
                <p className="text-xs text-text-muted">
                  Correct physical discrepancies, record cycle count audits, or write off damaged goods.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target Variant / Product */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Product / Variant *
                  </label>
                  <select
                    value={adjustTargetId || (selectedAdjustVariant?.id || "")}
                    onChange={(e) => setAdjustTargetId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-amber-600 focus:outline-none"
                    required
                  >
                    {allVariants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.sku}) - Physical: {v.stock} | Depot: {v.warehouse?.code || "GLOBAL"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Adjustment Mode */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Adjustment Mode *
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-amber-600 focus:outline-none"
                  >
                    <option value="SET">Set Exact Physical Count</option>
                    <option value="ADD">Add Units (+)</option>
                    <option value="SUBTRACT">Deduct Units (-)</option>
                  </select>
                </div>

                {/* Adjustment Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    {adjustType === "SET" ? "New Total Count" : "Delta Quantity"} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-amber-600 focus:outline-none font-mono font-bold"
                    required
                  />
                </div>

                {/* Reason Code */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Audit Reason Code *
                  </label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-amber-600 focus:outline-none"
                  >
                    <option value="CYCLE_COUNT">Periodic Physical Cycle Count</option>
                    <option value="DAMAGE">Damaged / Broken in Warehouse</option>
                    <option value="LOSS">Stock Loss / Shrinkage</option>
                    <option value="RESTOCK">Supplier Restock (Manual)</option>
                    <option value="RETURN">Customer Return Restock</option>
                    <option value="OTHER">Correction / Other</option>
                  </select>
                </div>

                {/* Reason Notes */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Audit Log Explanation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shelf audit mismatch found in aisle 4"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border p-2.5 bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  icon={Sliders}
                  disabled={isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 font-bold"
                >
                  {isPending ? "Applying Adjustment..." : "Record Stock Adjustment"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Right 1 Col: Operational Guidelines & Integrity Safeguards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00875A]" />
              Enterprise Dual-Ledger Protocol
            </h4>

            <div className="space-y-3 text-xs text-text-secondary">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Atomic Transactions:</strong> All depot inward, transfer, and adjustment operations are executed in isolated database transactions.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Checkout Locks:</strong> Active cart reservations and checkout holds are protected from write-offs and transfers automatically.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Immutable Audit Trail:</strong> Each movement generates an unalterable log record linked to your admin ID and timestamp.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50/60 rounded-2xl border border-purple-200 p-5 space-y-2 text-xs text-purple-900">
            <h4 className="font-bold flex items-center gap-2 text-purple-800">
              <Warehouse className="w-4 h-4" />
              Depot Multi-Fulfillment
            </h4>
            <p className="text-[11px] leading-relaxed">
              Stock received into any hub immediately updates available units in real-time. Shopper orders route to the closest depot with available physical units.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockOperationsView;
