import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScanBarcode,
  Printer,
  QrCode,
  Package,
  Layers,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

export function BarcodeStudioView({
  allVariants = [],
  onOpenBarcodeModal,
  onQuickAdjust,
  isPending = false,
}) {
  const navigate = useNavigate();
  const [scanInput, setScanInput] = useState("");
  const [foundItem, setFoundItem] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const term = scanInput.trim().toLowerCase();
    const matched = allVariants.find(
      (v) =>
        (v.sku && v.sku.toLowerCase() === term) ||
        (v.barcode && v.barcode.toLowerCase() === term) ||
        (v.id && v.id.toLowerCase() === term)
    );

    if (matched) {
      setFoundItem(matched);
      setFeedback({ type: "success", message: `Matched SKU: ${matched.sku}` });
    } else {
      setFoundItem(null);
      setFeedback({ type: "error", message: `No inventory record found matching "${scanInput}"` });
    }
  };

  const handleAdjustDelta = (delta) => {
    if (!foundItem) return;
    const newQty = Math.max(0, (foundItem.stock || 0) + delta);

    onQuickAdjust(
      {
        inventoryId: foundItem.inventoryId || foundItem.id,
        productId: foundItem.productId,
        variantId: foundItem.variantId,
        quantity: newQty,
        type: delta > 0 ? "RESTOCK" : "DAMAGE",
        notes: `Quick barcode terminal adjustment (${delta > 0 ? "+" : ""}${delta} units)`,
      },
      () => {
        setFoundItem((prev) => ({
          ...prev,
          stock: newQty,
          available: Math.max(0, newQty - (prev.reserved || 0)),
        }));
        setFeedback({
          type: "success",
          message: `Stock updated to ${newQty} units successfully.`,
        });
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Cards: Terminal Scanner vs Print Studio ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Interactive Terminal Scanner */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <ScanBarcode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Barcode Terminal Station</h3>
                <p className="text-xs text-text-muted">
                  Use hardware USB/Bluetooth barcode guns or manual keyboard lookup
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Camera}
              onClick={onOpenBarcodeModal}
              className="text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              Camera Scan
            </Button>
          </div>

          {/* Scanner Input Form */}
          <form onSubmit={handleScanSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-text-primary">
              Scan SKU / EAN / QR Payload:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Aim scanner gun or type SKU..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-surface-muted/30 p-2.5 text-xs font-mono font-bold focus:bg-white focus:border-slate-900 focus:outline-none"
              />
              <Button type="submit" variant="primary" size="sm" className="bg-slate-900 text-white font-bold">
                Lookup
              </Button>
            </div>
            <p className="text-[11px] text-text-muted">
              Press enter or trigger hardware scanner gun to instantly match stock.
            </p>
          </form>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Scanned Item Details Card */}
          {foundItem && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {foundItem.image ? (
                    <img
                      src={foundItem.image}
                      alt={foundItem.name}
                      className="w-12 h-12 rounded-xl object-cover border border-border shrink-0 shadow-2xs bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 text-slate-400">
                      <Package className="w-6 h-6 text-text-muted" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight truncate">{foundItem.name}</h4>
                    <p className="font-mono text-xs text-text-muted mt-0.5">
                      SKU: {foundItem.sku} | Depot: {foundItem.warehouse?.code || "CENTRAL"}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-white border border-slate-200 font-bold text-slate-800 shrink-0">
                  {foundItem.category}
                </span>
              </div>

              {/* Stock counters */}
              <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-lg border border-border">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">On-Hand</span>
                  <span className="font-mono font-bold text-sm text-slate-900">{foundItem.stock}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 uppercase font-bold block">Reserved</span>
                  <span className="font-mono font-bold text-sm text-amber-600">{foundItem.reserved}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#00875A] uppercase font-bold block">Available</span>
                  <span className="font-mono font-bold text-sm text-[#00875A]">{foundItem.available}</span>
                </div>
              </div>

              {/* Instant Quick Adjustment Buttons */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-700 block mb-2">
                  Rapid Terminal Adjustments:
                </span>
                <div className="flex items-center flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    icon={Plus}
                    disabled={isPending}
                    onClick={() => handleAdjustDelta(1)}
                    className="font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  >
                    +1 Unit
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    icon={Plus}
                    disabled={isPending}
                    onClick={() => handleAdjustDelta(5)}
                    className="font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  >
                    +5 Units
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    icon={Plus}
                    disabled={isPending}
                    onClick={() => handleAdjustDelta(10)}
                    className="font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  >
                    +10 Units
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    icon={Minus}
                    disabled={isPending || (foundItem.stock || 0) <= 0}
                    onClick={() => handleAdjustDelta(-1)}
                    className="font-bold border-rose-300 text-rose-800 hover:bg-rose-50"
                  >
                    -1 Unit
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    icon={Minus}
                    disabled={isPending || (foundItem.stock || 0) < 5}
                    onClick={() => handleAdjustDelta(-5)}
                    className="font-bold border-rose-300 text-rose-800 hover:bg-rose-50"
                  >
                    -5 Units
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Barcode & QR Label Studio Designer */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Barcode & QR Label Studio</h3>
                <p className="text-xs text-text-muted">
                  Batch generate and print industrial thermal stickers, shelf tags, and shipment QR codes
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-text-secondary">
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
                <QrCode className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-950 font-bold block">Full Multi-Format Layout Engine</strong>
                  <span className="text-indigo-800 text-[11px]">
                    Supports A4 grid sticker sheets, Letter format, 4x6" Thermal warehouse rolls, and compact 2x1" jewelry/box tags.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-950 font-bold block">Enterprise Lot & Batch Numbering</strong>
                  <span className="text-purple-800 text-[11px]">
                    Custom batch lot encoding, dual-entry product verification, and depot hub routing tags.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Opens full-screen high-resolution print studio
            </span>

            <Button
              variant="primary"
              size="md"
              icon={ExternalLink}
              onClick={() => navigate("/admin/inventory/print")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-2xs"
            >
              Launch Label Studio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarcodeStudioView;
