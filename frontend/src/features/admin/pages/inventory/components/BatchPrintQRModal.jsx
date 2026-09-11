import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Textarea } from "@/components/ui/Input.jsx";
import {
  Printer,
  QrCode,
  CheckSquare,
  Square,
  Sliders,
  FileText,
  LayoutGrid,
  Columns3,
  Layers,
  Sparkles,
} from "lucide-react";

export function BatchPrintQRModal({
  isOpen,
  onClose,
  items = [],
}) {
  const printRef = useRef(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState(() =>
    items.map((it) => it.id)
  );

  // QR, Paper & Label Options
  const [paperSize, setPaperSize] = useState("A4"); // A4 | Letter | A5 | Thermal4x6 | Thermal2x1
  const [qrSize, setQrSize] = useState("md"); // sm: 90, md: 130, lg: 170, xl: 210
  const [columns, setColumns] = useState("3"); // 1 | 2 | 3 | 4 | 5
  const [customFooterText, setCustomFooterText] = useState("VANOM Global Supply Chain • Verified Batch");
  const [batchLotNumber, setBatchLotNumber] = useState(`LOT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  // Field toggles
  const [visibleFields, setVisibleFields] = useState({
    showProductName: true,
    showSku: true,
    showCategory: true,
    showBrand: true,
    showStock: true,
    showLotNumber: true,
    showFooterText: true,
    showBorderCard: true,
  });

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((it) => it.id));
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

  const paperPageCss = {
    A4: "@page { size: A4 portrait; margin: 8mm; }",
    Letter: "@page { size: letter portrait; margin: 8mm; }",
    A5: "@page { size: A5 landscape; margin: 6mm; }",
    Thermal4x6: "@page { size: 4in 6in; margin: 3mm; }",
    Thermal2x1: "@page { size: 2in 1in; margin: 2mm; }",
  }[paperSize] || "@page { size: auto; margin: 8mm; }";

  const selectedItems = items.filter((it) => selectedIds.includes(it.id));

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const gridCols = columns;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vanom Inventory QR Labels Print Batch</title>
          <style>
            ${paperPageCss}
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: ${paperSize.startsWith("Thermal") ? "4px" : "10px"};
              color: #0F2B1C;
              background: #fff;
            }
            .header-bar {
              text-align: center;
              margin-bottom: 12px;
              padding-bottom: 6px;
              border-bottom: 2px solid #00875A;
              display: ${paperSize === "Thermal2x1" ? "none" : "block"};
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(${gridCols}, 1fr);
              gap: ${paperSize === "Thermal2x1" ? "4px" : "12px"};
            }
            .label-card {
              border: ${visibleFields.showBorderCard ? "1.5px dashed #00875A" : "none"};
              border-radius: 8px;
              padding: ${paperSize === "Thermal2x1" ? "4px" : "10px"};
              text-align: center;
              background: #fff;
              page-break-inside: avoid;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .prod-title {
              font-size: ${paperSize === "Thermal2x1" ? "9px" : "12px"};
              font-weight: 800;
              margin: 0 0 2px 0;
              color: #0F2B1C;
              max-width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .sku-tag {
              font-family: ui-monospace, monospace;
              font-size: ${paperSize === "Thermal2x1" ? "8px" : "11px"};
              font-weight: bold;
              color: #00875A;
              background: #E8F5E9;
              padding: 2px 6px;
              border-radius: 4px;
              display: inline-block;
              margin: 2px 0 4px 0;
            }
            .meta-text {
              font-size: 9px;
              color: #555;
              margin: 2px 0;
            }
            .lot-tag {
              font-size: 8px;
              font-family: monospace;
              color: #b45309;
              background: #fef3c7;
              padding: 1px 4px;
              border-radius: 4px;
              margin: 2px 0;
            }
            .qr-wrap {
              margin: 4px 0;
            }
            .footer-custom {
              font-size: 8px;
              color: #666;
              margin-top: 4px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <h2 style="margin:0; font-size: 14px; color:#00875A;">VANOM ENTERPRISE INVENTORY LABELS</h2>
            <p style="margin:2px 0 0 0; font-size: 10px; color:#666;">
              Paper: ${paperSize} • ${selectedItems.length} Products • Lot: ${batchLotNumber}
            </p>
          </div>
          <div class="grid">
            ${selectedItems
              .map(
                (item) => `
              <div class="label-card">
                ${visibleFields.showProductName ? `<div class="prod-title">${item.name}</div>` : ""}
                ${visibleFields.showSku ? `<div class="sku-tag">${item.sku || "SKU-STD"}</div>` : ""}
                ${
                  visibleFields.showCategory || visibleFields.showStock
                    ? `<div class="meta-text">
                        ${visibleFields.showCategory ? `Cat: ${item.category || "General"}` : ""}
                        ${visibleFields.showCategory && visibleFields.showStock ? " • " : ""}
                        ${visibleFields.showStock ? `Stock: ${item.stock || 0} Units` : ""}
                      </div>`
                    : ""
                }
                ${visibleFields.showLotNumber && batchLotNumber ? `<div class="lot-tag">${batchLotNumber}</div>` : ""}
                <div class="qr-wrap">
                  <svg width="${qrPixelSize}" height="${qrPixelSize}" viewBox="0 0 256 256">
                    ${document.getElementById(`qr-svg-${item.id}`)?.innerHTML || ""}
                  </svg>
                </div>
                ${visibleFields.showFooterText && customFooterText ? `<div class="footer-custom">${customFooterText}</div>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batch QR Code Label Studio & Print Center"
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6 text-xs text-text-primary max-h-[80vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left Column: Configuration Controls (5 cols) ── */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Item Selection Controls */}
            <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#00875A]" />
                  Select Catalog Products ({selectedIds.length}/{items.length})
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[11px] font-bold text-[#00875A] hover:underline cursor-pointer"
                >
                  {selectedIds.length === items.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {items.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelectItem(item.id)}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-emerald-50/60 border-[#00875A]/40 text-[#0F2B1C]"
                          : "bg-white border-border text-text-muted hover:bg-surface-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
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

            {/* 2. Paper Size, QR Size & Grid Layout */}
            <div className="p-4 rounded-2xl bg-white border border-border space-y-3 shadow-2xs">
              <h5 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-700" />
                Paper Format, QR Code & Grid Setup
              </h5>

              <div className="space-y-3">
                {/* Paper Size selector */}
                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Target Paper / Label Roll Size
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
                    className="w-full p-2 text-xs rounded-xl border border-border bg-white font-medium focus:outline-none focus:border-[#00875A]"
                  >
                    <option value="A4">Standard A4 Sheet (210 × 297 mm)</option>
                    <option value="Letter">US Letter Sheet (8.5 × 11 in)</option>
                    <option value="A5">A5 Compact Sheet (148 × 210 mm)</option>
                    <option value="Thermal4x6">Direct Thermal 4" × 6" (Shipping / Carton)</option>
                    <option value="Thermal2x1">Thermal Roll 2" × 1" (Mini Jewelry / Barcode)</option>
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
                      className="w-full p-2 text-xs rounded-xl border border-border bg-white font-medium focus:outline-none focus:border-[#00875A]"
                    >
                      <option value="sm">Small (90px)</option>
                      <option value="md">Medium (130px - Standard)</option>
                      <option value="lg">Large (170px)</option>
                      <option value="xl">Extra Large (210px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      Labels Per Row (Grid)
                    </label>
                    <select
                      value={columns}
                      onChange={(e) => setColumns(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-border bg-white font-medium focus:outline-none focus:border-[#00875A]"
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
                  <span className="font-semibold text-text-primary">SKU Code Badge</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleFields.showCategory}
                    onChange={() => toggleField("showCategory")}
                    className="accent-[#00875A] w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-text-primary">Category Name</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleFields.showStock}
                    onChange={() => toggleField("showStock")}
                    className="accent-[#00875A] w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-text-primary">Stock Quantity</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleFields.showLotNumber}
                    onChange={() => toggleField("showLotNumber")}
                    className="accent-[#00875A] w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-text-primary">Batch / Lot Tag</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleFields.showBorderCard}
                    onChange={() => toggleField("showBorderCard")}
                    className="accent-[#00875A] w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-text-primary">Dashed Cut Border</span>
                </label>
              </div>
            </div>

            {/* 4. Free Text & Custom Batch Customizations */}
            <div className="p-4 rounded-2xl bg-white border border-border space-y-3 shadow-2xs">
              <h5 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Custom Free Text & Lot Annotations
              </h5>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Batch / Lot Number
                  </label>
                  <input
                    type="text"
                    value={batchLotNumber}
                    onChange={(e) => setBatchLotNumber(e.target.value)}
                    placeholder="e.g. LOT-2026-B839"
                    className="w-full p-2 text-xs font-mono rounded-xl border border-border bg-white focus:outline-none focus:border-[#00875A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Custom Footer Free Text
                  </label>
                  <input
                    type="text"
                    value={customFooterText}
                    onChange={(e) => setCustomFooterText(e.target.value)}
                    placeholder="e.g. Organic Certified • Scan for verification dossier"
                    className="w-full p-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:border-[#00875A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Live Printable Sheet Preview (7 cols) ── */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#00875A]" />
                Live Printable Sheet Preview
              </h4>
              <span className="text-[11px] text-text-muted">
                {selectedItems.length} Label(s) ready to render
              </span>
            </div>

            {/* Live Preview Container */}
            <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 min-h-[500px] max-h-[580px] overflow-y-auto">
              {selectedItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-text-muted space-y-2">
                  <QrCode className="w-10 h-10 text-slate-300" />
                  <p className="font-semibold text-slate-600">No products selected</p>
                  <p className="text-[11px]">Select at least one product from the list to preview printable QR tags.</p>
                </div>
              ) : (
                <div
                  className={`grid gap-3.5 ${
                    columns === "2"
                      ? "grid-cols-2"
                      : columns === "4"
                      ? "grid-cols-4"
                      : "grid-cols-3"
                  }`}
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
                        className={`bg-white p-3 rounded-2xl flex flex-col items-center text-center shadow-xs transition-all ${
                          visibleFields.showBorderCard
                            ? "border-2 border-dashed border-[#00875A]/50"
                            : "border border-slate-200"
                        }`}
                      >
                        {visibleFields.showProductName && (
                          <h6 className="font-bold text-[11px] text-[#0F2B1C] truncate max-w-full leading-tight">
                            {item.name}
                          </h6>
                        )}

                        {visibleFields.showSku && (
                          <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md my-1">
                            {item.sku || "SKU-STD"}
                          </span>
                        )}

                        {(visibleFields.showCategory || visibleFields.showStock) && (
                          <p className="text-[9px] text-text-muted my-0.5 truncate max-w-full">
                            {visibleFields.showCategory && `${item.category || "General"}`}
                            {visibleFields.showCategory && visibleFields.showStock && " • "}
                            {visibleFields.showStock && `${item.stock || 0} Units`}
                          </p>
                        )}

                        {visibleFields.showLotNumber && batchLotNumber && (
                          <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded my-0.5">
                            {batchLotNumber}
                          </span>
                        )}

                        {/* SVG QR Code */}
                        <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs my-1.5">
                          <QRCodeSVG
                            id={`qr-svg-${item.id}`}
                            value={qrPayload}
                            size={Math.min(qrPixelSize, 150)}
                            level="H"
                            fgColor="#0F2B1C"
                          />
                        </div>

                        {visibleFields.showFooterText && customFooterText && (
                          <p className="text-[8px] text-slate-500 font-medium leading-tight max-w-full mt-1">
                            {customFooterText}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Action Footer ── */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-text-muted">
            Ready to print <strong className="text-text-primary">{selectedItems.length}</strong> labels ({columns} per row).
          </div>

          <div className="flex items-center gap-2.5">
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={Printer}
              onClick={handlePrint}
              disabled={selectedItems.length === 0}
              className="font-bold shadow-xs cursor-pointer"
            >
              Print {selectedItems.length} QR Labels Now
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BatchPrintQRModal;
