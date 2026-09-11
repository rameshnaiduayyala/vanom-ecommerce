import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { QrCode, Download, Printer, Package, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/Toast.jsx";

export function QRCodeModal({ item, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  if (!isOpen || !item) return null;

  const qrValue = JSON.stringify({
    productId: item.productId || item.id,
    sku: item.sku,
    name: item.name,
    category: item.category,
    stock: item.stock,
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(item.sku || item.id);
    setCopied(true);
    toast.success("SKU Copied", "Product SKU copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code Label - ${item.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { border: 2px dashed #00875A; border-radius: 16px; padding: 24px; max-width: 320px; }
            h2 { font-size: 18px; margin: 0 0 8px 0; color: #0F2B1C; }
            p { font-size: 12px; margin: 4px 0; color: #555; }
            .sku { font-family: monospace; font-size: 14px; font-weight: bold; color: #00875A; background: #e8f5e9; padding: 4px 8px; border-radius: 6px; display: inline-block; margin: 8px 0; }
            .qr-wrap { margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>${item.name}</h2>
            <div class="sku">${item.sku || "SKU-STD"}</div>
            <p>Category: ${item.category || "General"} | Stock: ${item.stock || 0} Units</p>
            <div class="qr-wrap">
              ${qrRef.current?.innerHTML || ""}
            </div>
            <p style="font-size: 10px; color: #888;">Vanom Enterprise Inventory Label</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
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
      title="Product Inventory QR Code Tag"
      maxWidth="max-w-md"
    >
      <div className="space-y-6 text-xs text-text-primary text-center">
        {/* QR Code Canvas Frame */}
        <div className="p-6 rounded-3xl bg-white border-2 border-dashed border-[#00875A]/40 shadow-xs flex flex-col items-center justify-center space-y-4">
          <div
            ref={qrRef}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs inline-block"
          >
            <QRCodeSVG
              value={qrValue}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#0F2B1C"
            />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-text-primary">{item.name}</h4>
            <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-text-muted">
              <span>SKU: <strong className="text-emerald-800 font-bold">{item.sku}</strong></span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                title="Copy SKU"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Badge variant="brand" size="sm">
              {item.category || "General"}
            </Badge>
            <Badge variant="success" size="sm">
              {item.stock || 0} Units On-Hand
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            icon={Printer}
            onClick={handlePrint}
            className="w-full font-bold cursor-pointer"
          >
            Print Label
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-full cursor-pointer"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default QRCodeModal;
