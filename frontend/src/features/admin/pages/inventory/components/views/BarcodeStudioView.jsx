import React, { useState, useEffect, useRef } from "react";
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
  Smartphone,
  Monitor,
  Zap,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { LiveCameraScanner } from "../LiveCameraScanner.jsx";

export function BarcodeStudioView({
  allVariants = [],
  onOpenBarcodeModal,
  onQuickAdjust,
  isPending = false,
}) {
  const navigate = useNavigate();

  // Detect initial device mode (Mobile vs Web Desktop)
  const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 768;
  const [deviceMode, setDeviceMode] = useState(isMobileScreen ? "mobile" : "web"); // "mobile" | "web"
  const [scanInput, setScanInput] = useState("");
  const [foundItem, setFoundItem] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  // Hardware barcode buffer scanner listener for Web Desktop mode
  const barcodeBufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  // Common item matcher
  const matchItemCode = (rawCode) => {
    if (!rawCode) return;
    const term = rawCode.trim().toLowerCase();
    if (!term) return;

    const matched = allVariants.find(
      (v) =>
        (v.sku && v.sku.toLowerCase() === term) ||
        (v.barcode && v.barcode.toLowerCase() === term) ||
        (v.id && v.id.toLowerCase() === term) ||
        (v.name && v.name.toLowerCase() === term)
    );

    if (matched) {
      setFoundItem(matched);
      setFeedback({ type: "success", message: `Matched: ${matched.name} (${matched.sku})` });
      setRecentScans((prev) => [
        {
          id: `${matched.id}_${Date.now()}`,
          name: matched.name,
          sku: matched.sku,
          image: matched.image,
          time: new Date().toLocaleTimeString(),
          stock: matched.stock,
          item: matched,
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      setFoundItem(null);
      setFeedback({ type: "error", message: `No inventory record found matching "${rawCode}"` });
    }
  };

  const handleScanSubmit = (e) => {
    if (e) e.preventDefault();
    matchItemCode(scanInput);
  };

  // Global listener for USB / Bluetooth hardware barcode gun scanners on Web Desktop
  useEffect(() => {
    if (deviceMode !== "web") return;

    const handleGlobalKeyDown = (e) => {
      // Ignore if user is typing in standard textareas or other inputs
      const targetTag = e.target?.tagName?.toLowerCase();
      if (targetTag === "textarea" || (targetTag === "input" && e.target.type !== "text")) {
        return;
      }

      const now = Date.now();
      // Hardware scanner guns input characters rapidly (< 50ms apart)
      if (now - lastKeyTimeRef.current > 120) {
        barcodeBufferRef.current = "";
      }
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const buffered = barcodeBufferRef.current.trim();
        if (buffered.length >= 3) {
          e.preventDefault();
          setScanInput(buffered);
          matchItemCode(buffered);
          barcodeBufferRef.current = "";
        }
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [deviceMode, allVariants]);

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
      {/* ─── Mode Selector Toolbar: Web vs Mobile ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-[#00875A]" />
            <span>Barcode & SKU Scanner Terminal</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {deviceMode === "mobile"
              ? "Mobile camera active for warehouse handheld scanning & instant stock adjustment"
              : "Optimized for desktop workstation with hardware USB/BT scanner gun & thermal label printer"}
          </p>
        </div>

        {/* Device Switcher Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-muted border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDeviceMode("mobile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              deviceMode === "mobile"
                ? "bg-white text-emerald-800 shadow-2xs border border-border/80"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Mobile Camera View</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode("web")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              deviceMode === "web"
                ? "bg-white text-slate-900 shadow-2xs border border-border/80"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Monitor className="w-4 h-4 text-slate-700" />
            <span>Web Desktop Station</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE VIEW: Live Camera Viewfinder + Touch Terminal
         ══════════════════════════════════════════════════════════════ */}
      {deviceMode === "mobile" && (
        <div className="space-y-4 max-w-xl mx-auto">
          {/* 1. Live Camera Scanner Box */}
          <div className="bg-white rounded-2xl border border-border p-3 shadow-2xs space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Camera Viewfinder</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                Auto-Detect Enabled
              </span>
            </div>

            {/* Embedded Live Camera with Laser Reticle */}
            <LiveCameraScanner
              onScan={(scannedCode) => {
                setScanInput(scannedCode);
                matchItemCode(scannedCode);
              }}
              className="h-64 sm:h-72 w-full"
            />

            {/* Quick Manual Code Input for Mobile */}
            <form onSubmit={handleScanSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Or type SKU / Barcode..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 font-mono focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
              <Button type="submit" variant="primary" size="sm" className="font-bold cursor-pointer">
                Match
              </Button>
            </form>
          </div>

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
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* 2. Mobile Scanned Item Dossier & Touch Actions */}
          {foundItem ? (
            <div className="bg-white rounded-2xl border border-emerald-400 p-4 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                {foundItem.image ? (
                  <img
                    src={foundItem.image}
                    alt={foundItem.name}
                    className="w-16 h-16 rounded-xl object-cover border border-emerald-200 shadow-2xs shrink-0 bg-slate-50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700">
                    <Package className="w-8 h-8" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                    {foundItem.category || "Catalog Item"}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight truncate">
                    {foundItem.name}
                  </h4>
                  <p className="font-mono text-xs text-text-muted mt-0.5">
                    SKU: <strong className="text-slate-800">{foundItem.sku}</strong>
                  </p>
                </div>
              </div>

              {/* 3-Column Stock Stats */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">On-Hand</span>
                  <span className="font-mono font-black text-base text-slate-900">{foundItem.stock}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 uppercase font-bold block">Reserved</span>
                  <span className="font-mono font-black text-base text-amber-600">{foundItem.reserved}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#00875A] uppercase font-bold block">Available</span>
                  <span className="font-mono font-black text-base text-[#00875A]">{foundItem.available}</span>
                </div>
              </div>

              {/* Mobile Large Touch Adjustment Buttons */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-800 block">
                  Quick Mobile Restock / Deduct:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAdjustDelta(1)}
                    className="py-2.5 rounded-xl font-bold text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition-all active:scale-95 cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAdjustDelta(5)}
                    className="py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 cursor-pointer"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAdjustDelta(10)}
                    className="py-2.5 rounded-xl font-bold text-xs bg-[#005A32] hover:bg-[#004727] text-white transition-all active:scale-95 cursor-pointer"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    disabled={isPending || (foundItem.stock || 0) <= 0}
                    onClick={() => handleAdjustDelta(-1)}
                    className="py-2.5 rounded-xl font-bold text-xs bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 transition-all active:scale-95 cursor-pointer"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    disabled={isPending || (foundItem.stock || 0) < 5}
                    onClick={() => handleAdjustDelta(-5)}
                    className="py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-all active:scale-95 cursor-pointer"
                  >
                    -5
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Mobile Quick Pick Carousel */
            <div className="bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-3">
              <h5 className="font-bold text-xs text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00875A]" />
                <span>Tap Item from Catalog ({allVariants.length})</span>
              </h5>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {allVariants.slice(0, 6).map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setScanInput(v.sku);
                      matchItemCode(v.sku);
                    }}
                    className="p-2 rounded-xl border border-border hover:border-[#00875A] hover:bg-emerald-50/40 cursor-pointer transition-all flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {v.image ? (
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center shrink-0 text-text-muted">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">{v.name}</p>
                        <span className="font-mono text-[10px] text-text-muted block">{v.sku}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-800 shrink-0">
                      {v.stock} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          WEB DESKTOP VIEW: Hardware Scanner Gun Terminal + Label Studio
         ══════════════════════════════════════════════════════════════ */}
      {deviceMode === "web" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── LEFT: Desktop Terminal Station (7 Cols) ── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-5">
            {/* Workstation Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <ScanBarcode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Workstation Barcode Station</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Hardware Scanner Gun Active
                    </span>
                    <span className="text-xs text-text-muted">• Buffer Listening</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={Camera}
                onClick={onOpenBarcodeModal}
                className="text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
              >
                Open Camera Modal
              </Button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleScanSubmit} className="space-y-2">
              <label className="block text-xs font-semibold text-text-primary">
                Barcode Gun Input / Manual SKU Lookup:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Aim barcode gun or type SKU..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-surface-muted/30 p-2.5 text-xs font-mono font-bold focus:bg-white focus:border-slate-900 focus:outline-none"
                />
                <Button type="submit" variant="primary" size="sm" className="bg-slate-900 text-white font-bold cursor-pointer">
                  Lookup SKU
                </Button>
              </div>
              <p className="text-[11px] text-text-muted flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Hardware USB/Bluetooth scanners trigger instant product resolution upon read.</span>
              </p>
            </form>

            {/* Feedback notification */}
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

            {/* Matched Product Dossier Card */}
            {foundItem && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {foundItem.image ? (
                      <img
                        src={foundItem.image}
                        alt={foundItem.name}
                        className="w-14 h-14 rounded-xl object-cover border border-border shrink-0 shadow-2xs bg-white"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 text-slate-400">
                        <Package className="w-6 h-6 text-text-muted" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 leading-tight truncate">
                        {foundItem.name}
                      </h4>
                      <p className="font-mono text-xs text-text-muted mt-0.5">
                        SKU: <strong className="text-slate-800">{foundItem.sku}</strong> | Depot: {foundItem.warehouse?.code || "CENTRAL"}
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
                    Workstation Rapid Adjustments:
                  </span>
                  <div className="flex items-center flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Plus}
                      disabled={isPending}
                      onClick={() => handleAdjustDelta(1)}
                      className="font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                    >
                      +1 Unit
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Plus}
                      disabled={isPending}
                      onClick={() => handleAdjustDelta(5)}
                      className="font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                    >
                      +5 Units
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Plus}
                      disabled={isPending}
                      onClick={() => handleAdjustDelta(10)}
                      className="font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                    >
                      +10 Units
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Minus}
                      disabled={isPending || (foundItem.stock || 0) <= 0}
                      onClick={() => handleAdjustDelta(-1)}
                      className="font-bold border-rose-300 text-rose-800 hover:bg-rose-50 cursor-pointer"
                    >
                      -1 Unit
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Minus}
                      disabled={isPending || (foundItem.stock || 0) < 5}
                      onClick={() => handleAdjustDelta(-5)}
                      className="font-bold border-rose-300 text-rose-800 hover:bg-rose-50 cursor-pointer"
                    >
                      -5 Units
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Scans Session Strip */}
            {recentScans.length > 0 && (
              <div className="pt-3 border-t border-border space-y-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  Recent Station Scans ({recentScans.length})
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {recentScans.map((rc) => (
                    <div
                      key={rc.id}
                      onClick={() => {
                        setScanInput(rc.sku);
                        setFoundItem(rc.item);
                      }}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 cursor-pointer shrink-0 text-xs transition-colors"
                    >
                      {rc.image ? (
                        <img src={rc.image} alt={rc.name} className="w-7 h-7 rounded object-cover border border-border" />
                      ) : (
                        <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-text-muted">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[11px] text-slate-800 truncate max-w-[120px]">{rc.name}</p>
                        <span className="font-mono text-[9px] text-text-muted">{rc.sku}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Label Studio & Thermal Designer (5 Cols) ── */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-border p-6 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Barcode & QR Label Studio</h3>
                  <p className="text-xs text-text-muted">
                    Generate industrial thermal stickers, shelf tags, and shipment QR codes
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
                Desktop print preview station
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
      )}
    </div>
  );
}

export default BarcodeStudioView;
