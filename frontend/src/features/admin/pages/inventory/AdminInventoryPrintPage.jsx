import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import {
  ArrowLeft,
  Printer,
  QrCode,
  CheckSquare,
  Square,
  Sliders,
  FileText,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { useAdminInventory } from "./hooks/useAdminInventory.js";

export function AdminInventoryPrintPage() {
  const navigate = useNavigate();
  const { filteredInventory } = useAdminInventory();
  const printComponentRef = useRef(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  // Initialize selection once inventory loads
  if (!hasInitializedSelection && filteredInventory.length > 0) {
    setSelectedIds(filteredInventory.map((it) => it.id));
    setHasInitializedSelection(true);
  }

  // Paper & QR Layout options
  const [paperSize, setPaperSize] = useState("A4"); // A4 | Letter | A5 | Thermal4x6 | Thermal2x1
  const [qrSize, setQrSize] = useState("md"); // sm: 90, md: 130, lg: 170, xl: 210
  const [columns, setColumns] = useState("3"); // 1 | 2 | 3 | 4 | 5
  const [customFooterText, setCustomFooterText] = useState("VANOM Global Supply Chain • Verified Batch");
  const [batchLotNumber, setBatchLotNumber] = useState(
    `LOT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // Field toggles
  const [visibleFields, setVisibleFields] = useState({
    showProductName: true,
    showSku: true,
    showCategory: true,
    showStock: true,
    showLotNumber: true,
    showFooterText: true,
    showBorderCard: true,
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInventory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInventory.map((it) => it.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleField = (field) => {
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const qrPixelSize = {
    sm: 90,
    md: 130,
    lg: 170,
    xl: 210,
  }[qrSize] || 130;

  const selectedItems = filteredInventory.filter((it) => selectedIds.includes(it.id));

  // CSS page dimensions passed to react-to-print
  const paperPageSizeCss = {
    A4: "@page { size: A4 portrait; margin: 8mm; }",
    Letter: "@page { size: letter portrait; margin: 8mm; }",
    A5: "@page { size: A5 landscape; margin: 6mm; }",
    Thermal4x6: "@page { size: 4in 6in; margin: 3mm; }",
    Thermal2x1: "@page { size: 2in 1in; margin: 2mm; }",
  }[paperSize] || "@page { size: auto; margin: 8mm; }";

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `VANOM-Labels-${paperSize}-${new Date().toISOString().slice(0, 10)}`,
    pageStyle: `
      ${paperPageSizeCss}
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .no-print {
          display: none !important;
        }
        .page-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
    `,
  });

  return (
    <div className="space-y-6">
      {/* ─── Top Header Navigation Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/admin/inventory")}
            className="cursor-pointer font-semibold"
          >
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
              <QrCode className="w-6 h-6 text-[#00875A]" />
              Barcode & QR Code Printing Studio
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Full-page print studio with exact paper formatting (A4, Letter, A5, Direct Thermal 4x6 & 2x1).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Printer}
            onClick={() => handlePrint()}
            disabled={selectedItems.length === 0}
            className="font-bold shadow-md cursor-pointer px-5"
          >
            Print {selectedItems.length} Label(s)
          </Button>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Configuration Settings (4 cols) ── */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Item Selection Controls */}
          <div className="p-4 rounded-2xl bg-white border border-border space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#00875A]" />
                Select Products ({selectedIds.length}/{filteredInventory.length})
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-[#00875A] hover:underline cursor-pointer"
              >
                {selectedIds.length === filteredInventory.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {filteredInventory.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectItem(item.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-emerald-50/60 border-[#00875A]/40 text-[#0F2B1C]"
                        : "bg-surface-muted/20 border-border text-text-muted hover:bg-surface-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#00875A] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className="font-bold text-xs truncate text-text-primary">{item.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted shrink-0">{item.sku}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Paper Size & QR Setup */}
          <div className="p-4 rounded-2xl bg-white border border-border space-y-3 shadow-2xs">
            <h5 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-700" />
              Paper Format & Dimensions
            </h5>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Target Paper Size / Roll
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaperSize(val);
                    if (val === "Thermal2x1") {
                      setColumns("1");
                      setQrSize("sm");
                    } else if (val === "Thermal4x6") {
                      setColumns("1");
                      setQrSize("lg");
                    } else if (val === "A5") {
                      setColumns("2");
                    } else if (val === "A4" || val === "Letter") {
                      setColumns("3");
                    }
                  }}
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-white font-medium focus:outline-none focus:border-[#00875A]"
                >
                  <option value="A4">Standard A4 Sheet (210 × 297 mm)</option>
                  <option value="Letter">US Letter Sheet (8.5 × 11 in)</option>
                  <option value="A5">A5 Compact Sheet (148 × 210 mm)</option>
                  <option value="Thermal4x6">Direct Thermal 4" × 6" (Shipping / Carton)</option>
                  <option value="Thermal2x1">Thermal Roll 2" × 1" (Mini Barcode / Jewelry)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    QR Code Size
                  </label>
                  <select
                    value={qrSize}
                    onChange={(e) => setQrSize(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-border bg-white font-medium focus:outline-none focus:border-[#00875A]"
                  >
                    <option value="sm">Small (90px)</option>
                    <option value="md">Medium (130px - Standard)</option>
                    <option value="lg">Large (170px)</option>
                    <option value="xl">Extra Large (210px)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Grid Columns
                  </label>
                  <select
                    value={columns}
                    onChange={(e) => setColumns(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-border bg-white font-medium focus:outline-none focus:border-[#00875A]"
                  >
                    <option value="1">1 Column (Single Roll / 4x6)</option>
                    <option value="2">2 Columns (Large Format)</option>
                    <option value="3">3 Columns (Standard Sheet)</option>
                    <option value="4">4 Columns (Compact Sheet)</option>
                    <option value="5">5 Columns (Mini Labels)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Visible Field Checkboxes */}
          <div className="p-4 rounded-2xl bg-white border border-border space-y-3 shadow-2xs">
            <h5 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              Visible Label Attributes (Toggle On/Off)
            </h5>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleFields.showProductName}
                  onChange={() => toggleField("showProductName")}
                  className="accent-[#00875A] w-4 h-4 rounded"
                />
                <span className="font-semibold text-text-primary">Product Title</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleFields.showSku}
                  onChange={() => toggleField("showSku")}
                  className="accent-[#00875A] w-4 h-4 rounded"
                />
                <span className="font-semibold text-text-primary">SKU Code</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleFields.showCategory}
                  onChange={() => toggleField("showCategory")}
                  className="accent-[#00875A] w-4 h-4 rounded"
                />
                <span className="font-semibold text-text-primary">Category</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleFields.showStock}
                  onChange={() => toggleField("showStock")}
                  className="accent-[#00875A] w-4 h-4 rounded"
                />
                <span className="font-semibold text-text-primary">Stock Count</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleFields.showLotNumber}
                  onChange={() => toggleField("showLotNumber")}
                  className="accent-[#00875A] w-4 h-4 rounded"
                />
                <span className="font-semibold text-text-primary">Lot / Batch Tag</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleFields.showBorderCard}
                  onChange={() => toggleField("showBorderCard")}
                  className="accent-[#00875A] w-4 h-4 rounded"
                />
                <span className="font-semibold text-text-primary">Cut Border</span>
              </label>
            </div>
          </div>

          {/* 4. Free Text Inputs */}
          <div className="p-4 rounded-2xl bg-white border border-border space-y-3 shadow-2xs">
            <h5 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Custom Free-Text & Lot Number
            </h5>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Batch / Lot Identifier
                </label>
                <input
                  type="text"
                  value={batchLotNumber}
                  onChange={(e) => setBatchLotNumber(e.target.value)}
                  placeholder="e.g. LOT-2026-X99"
                  className="w-full p-2.5 text-xs font-mono rounded-xl border border-border bg-white focus:outline-none focus:border-[#00875A]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Custom Footer Free-Text
                </label>
                <input
                  type="text"
                  value={customFooterText}
                  onChange={(e) => setCustomFooterText(e.target.value)}
                  placeholder="e.g. Verified Stock • Keep Refrigerated"
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-white focus:outline-none focus:border-[#00875A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Live Sheet Preview Canvas (8 cols) ── */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border shadow-2xs">
            <div>
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#00875A]" />
                Print Canvas ({paperSize})
              </h3>
              <p className="text-xs text-text-muted">
                {selectedItems.length} label(s) • Formatted for precise physical print output
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={() => handlePrint()}
              disabled={selectedItems.length === 0}
              className="font-bold shadow-xs cursor-pointer"
            >
              Print Labels Now
            </Button>
          </div>

          {/* Printable Preview Canvas with ref for react-to-print */}
          <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 min-h-[600px] max-h-[calc(100vh-280px)] overflow-y-auto">
            {selectedItems.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center text-text-muted space-y-3">
                <QrCode className="w-12 h-12 text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No Products Selected</p>
                <p className="text-xs max-w-sm">
                  Select products from the left-hand panel to preview your batch QR code labels.
                </p>
              </div>
            ) : (
              <div
                ref={printComponentRef}
                style={{
                  padding: paperSize.startsWith("Thermal") ? "4px" : "12px",
                  background: "#ffffff",
                  borderRadius: "12px",
                }}
              >
                {/* Print Header */}
                {paperSize !== "Thermal2x1" && (
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "12px",
                      paddingBottom: "6px",
                      borderBottom: "2px solid #00875A",
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#00875A" }}>
                      VANOM ENTERPRISE INVENTORY LABELS
                    </h2>
                    <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#666" }}>
                      Paper: {paperSize} • {selectedItems.length} Labels • Lot: {batchLotNumber}
                    </p>
                  </div>
                )}

                {/* Print Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    gap: paperSize === "Thermal2x1" ? "4px" : "12px",
                  }}
                >
                  {selectedItems.map((item) => {
                    const qrPayload = JSON.stringify({
                      productId: item.productId || item.id,
                      sku: item.sku,
                      name: item.name,
                      stock: item.stock,
                    });

                    return (
                      <div
                        key={item.id}
                        className="page-break"
                        style={{
                          background: "#ffffff",
                          border: visibleFields.showBorderCard ? "1.5px dashed #00875A" : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: paperSize === "Thermal2x1" ? "4px" : "10px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          boxSizing: "border-box",
                        }}
                      >
                        {visibleFields.showProductName && (
                          <h6
                            style={{
                              margin: "0 0 2px 0",
                              fontSize: paperSize === "Thermal2x1" ? "9px" : "12px",
                              fontWeight: "bold",
                              color: "#0F2B1C",
                              maxWidth: "100%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.name}
                          </h6>
                        )}

                        {visibleFields.showSku && (
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: paperSize === "Thermal2x1" ? "8px" : "10px",
                              fontWeight: "bold",
                              color: "#00875A",
                              background: "#E8F5E9",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              margin: "2px 0 4px 0",
                              display: "inline-block",
                            }}
                          >
                            {item.sku || "SKU-STD"}
                          </span>
                        )}

                        {(visibleFields.showCategory || visibleFields.showStock) && (
                          <p
                            style={{
                              margin: "2px 0",
                              fontSize: "9px",
                              color: "#666",
                              maxWidth: "100%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {visibleFields.showCategory && `${item.category || "General"}`}
                            {visibleFields.showCategory && visibleFields.showStock && " • "}
                            {visibleFields.showStock && `${item.stock || 0} Units`}
                          </p>
                        )}

                        {visibleFields.showLotNumber && batchLotNumber && (
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "8px",
                              fontWeight: "bold",
                              color: "#b45309",
                              background: "#fef3c7",
                              padding: "1px 4px",
                              borderRadius: "4px",
                              margin: "2px 0",
                            }}
                          >
                            {batchLotNumber}
                          </span>
                        )}

                        {/* Direct Vector QR Code SVG */}
                        <div
                          style={{
                            margin: "4px 0",
                            padding: "4px",
                            background: "#ffffff",
                            borderRadius: "6px",
                            display: "inline-block",
                          }}
                        >
                          <QRCodeSVG
                            value={qrPayload}
                            size={Math.min(qrPixelSize, paperSize === "Thermal2x1" ? 70 : 160)}
                            level="H"
                            fgColor="#0F2B1C"
                          />
                        </div>

                        {visibleFields.showFooterText && customFooterText && (
                          <p
                            style={{
                              margin: "3px 0 0 0",
                              fontSize: "8px",
                              color: "#666",
                              fontWeight: 500,
                              lineHeight: "1.2",
                              maxWidth: "100%",
                            }}
                          >
                            {customFooterText}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminInventoryPrintPage;
