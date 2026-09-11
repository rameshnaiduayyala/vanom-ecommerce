import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import {
  ScanBarcode,
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  Layers,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react";

export function BarcodeScannerModal({
  isOpen,
  onClose,
  variants = [],
  onQuickAdjust,
  isPending,
}) {
  const [scannedCode, setScannedCode] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const [scanQty, setScanQty] = useState(1);
  const [actionType, setActionType] = useState("ADD"); // ADD | DEDUCT

  if (!isOpen) return null;

  const handleSearchCode = (codeToFind) => {
    const trimmed = (codeToFind || scannedCode).trim().toLowerCase();
    if (!trimmed) return;

    const found = variants.find(
      (v) =>
        (v.sku && v.sku.toLowerCase() === trimmed) ||
        (v.barcode && v.barcode.toLowerCase() === trimmed) ||
        (v.id && v.id.toLowerCase() === trimmed) ||
        (v.name && v.name.toLowerCase().includes(trimmed))
    );

    if (found) {
      setActiveItem(found);
    } else {
      setActiveItem(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchCode();
    }
  };

  const handleApplyAdjustment = () => {
    if (!activeItem) return;
    const signedQty = actionType === "ADD" ? Number(scanQty) : -Number(scanQty);

    onQuickAdjust(
      {
        productId: activeItem.productId,
        variantId: activeItem.id,
        quantity: signedQty,
        type: actionType === "ADD" ? "PURCHASE" : "ADJUSTMENT",
        reason: `Barcode Quick Scan [${activeItem.barcode || activeItem.sku}]`,
      },
      () => {
        // Clear or keep ready for next scan
        setScannedCode("");
        setActiveItem(null);
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode & SKU Rapid Scanner Terminal"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-xs text-text-primary">
        {/* Scanner Input Bar */}
        <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-border space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <ScanBarcode className="w-4 h-4 text-[#00875A]" />
              <span>Scan Barcode / SKU Input</span>
            </label>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-bold">
              Ready for Hardware Scanners & Manual SKU
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={scannedCode}
                onChange={(e) => {
                  setScannedCode(e.target.value);
                  handleSearchCode(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Scan or type barcode (e.g. SKU-KASH-SAF-01, VN-8392)..."
                className="w-full pl-9 pr-4 py-2.5 text-xs font-mono rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 focus:border-[#00875A]"
              />
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => handleSearchCode()}
              className="font-bold cursor-pointer"
            >
              Lookup SKU
            </Button>
          </div>
        </div>

        {/* Scanned Item Dossier Box */}
        {activeItem ? (
          <div className="p-5 rounded-2xl bg-white border border-emerald-300 shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-[#00875A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-text-primary">
                      {activeItem.name || activeItem.productName}
                    </h4>
                    <Badge variant="success" size="sm">
                      Verified Barcode
                    </Badge>
                  </div>
                  <div className="text-[11px] text-text-muted font-mono flex items-center gap-2 mt-0.5">
                    <span>SKU: <strong className="text-text-primary">{activeItem.sku}</strong></span>
                    <span>•</span>
                    <span>Barcode: <strong className="text-emerald-800">{activeItem.barcode}</strong></span>
                  </div>
                </div>
              </div>

              {/* Current Stock Tag */}
              <div className="text-right sm:border-l sm:border-border sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-text-muted block">
                  Current Stock On-Hand
                </span>
                <span className="text-lg font-black text-slate-900">
                  {activeItem.stock} <span className="text-xs font-normal text-slate-500">Units</span>
                </span>
              </div>
            </div>

            {/* Quick Adjustment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-bold text-text-secondary block">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("ADD")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      actionType === "ADD"
                        ? "bg-emerald-50 border-[#00875A] text-[#00875A] ring-2 ring-[#00875A]/20"
                        : "bg-white border-border text-text-muted hover:bg-surface-muted"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Restock (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType("DEDUCT")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      actionType === "DEDUCT"
                        ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20"
                        : "bg-white border-border text-text-muted hover:bg-surface-muted"
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Deduct (-)</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-text-secondary block">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={scanQty}
                  onChange={(e) => setScanQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs font-bold text-center rounded-xl border border-border bg-white focus:outline-none focus:border-[#00875A]"
                />
              </div>

              <div className="sm:col-span-4">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleApplyAdjustment}
                  isLoading={isPending}
                  className="w-full font-bold shadow-xs cursor-pointer justify-center"
                >
                  Apply {actionType === "ADD" ? `+${scanQty}` : `-${scanQty}`} Units
                </Button>
              </div>
            </div>
          </div>
        ) : scannedCode ? (
          <div className="p-6 rounded-2xl bg-surface-muted border border-border text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
            <p className="font-bold text-text-primary">No product match found for "{scannedCode}"</p>
            <p className="text-[11px] text-text-muted">
              Ensure the barcode or SKU matches an active catalog product variant.
            </p>
          </div>
        ) : (
          /* Quick Scan Shortcuts / Available Items */
          <div className="space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00875A]" />
              Quick Select from Catalog ({variants.length} items)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {variants.slice(0, 8).map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setScannedCode(v.sku);
                    setActiveItem(v);
                  }}
                  className="p-2.5 rounded-xl border border-border bg-white hover:border-[#00875A] hover:bg-emerald-50/40 cursor-pointer transition-all flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <p className="font-bold text-text-primary truncate">{v.name}</p>
                    <span className="font-mono text-[10px] text-text-muted">{v.sku}</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-800 shrink-0">
                    {v.stock} units
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close Terminal
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default BarcodeScannerModal;
