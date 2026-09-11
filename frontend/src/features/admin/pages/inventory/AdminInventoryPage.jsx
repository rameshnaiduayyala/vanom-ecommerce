import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, RefreshCw, ArrowRightLeft, ScanBarcode, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { useAdminInventory } from "./hooks/useAdminInventory.js";
import { InventoryMetrics } from "./components/InventoryMetrics.jsx";
import { InventoryFilter } from "./components/InventoryFilter.jsx";
import { InventoryTable } from "./components/InventoryTable.jsx";
import { StockAdjustmentModal } from "./components/StockAdjustmentModal.jsx";
import { BarcodeScannerModal } from "./components/BarcodeScannerModal.jsx";
import { QRCodeModal } from "./components/QRCodeModal.jsx";

export function AdminInventoryPage() {
  const navigate = useNavigate();
  const {
    filteredInventory,
    categories,
    allVariants,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    adjustMutation,
    metrics,
  } = useAdminInventory();

  // Modals state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [qrModalItem, setQrModalItem] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const handleOpenAdjust = (row = null) => {
    if (row) {
      const matchedVariant = allVariants.find(
        (v) => v.productId === row.id || v.id === row.id
      );
      setSelectedTarget(matchedVariant || { productId: row.id, id: row.id });
    } else {
      setSelectedTarget(allVariants[0] || null);
    }
    setAdjustModalOpen(true);
  };

  const handleOpenBarcodeScan = () => {
    setBarcodeModalOpen(true);
  };

  const handleOpenQR = (row) => {
    setQrModalItem(row);
  };

  const handleStockSubmit = (payload) => {
    adjustMutation.mutate(payload, {
      onSuccess: () => setAdjustModalOpen(false),
    });
  };

  const handleQuickAdjust = (payload, onComplete) => {
    adjustMutation.mutate(payload, {
      onSuccess: () => {
        if (onComplete) onComplete();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-[#00875A]" />
            Enterprise Stock & Inventory Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time stock on-hand, reservation locks, batch QR label printing studio, and direct restock adjustments.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => navigate("/admin/inventory/print")}
            className="font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer shadow-xs"
          >
            Print Barcode / QR Page
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={ScanBarcode}
            onClick={() => handleOpenBarcodeScan()}
            className="font-bold border-slate-300 text-slate-800 hover:bg-emerald-50 hover:border-[#00875A] cursor-pointer"
          >
            Barcode Scanner Terminal
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetch()}
            className="cursor-pointer"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={ArrowRightLeft}
            onClick={() => handleOpenAdjust()}
            className="font-bold shadow-xs cursor-pointer"
          >
            Adjust / Restock
          </Button>
        </div>
      </div>

      {/* ─── Metric KPI Cards ─── */}
      <InventoryMetrics metrics={metrics} />

      {/* ─── Search & Category Filters ─── */}
      <InventoryFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        totalCount={filteredInventory.length}
      />

      {/* ─── Inventory Catalog Table ─── */}
      <InventoryTable
        items={filteredInventory}
        isLoading={isLoading}
        onAdjust={handleOpenAdjust}
        onShowQR={handleOpenQR}
      />

      {/* ─── Generated QR Code Label Modal (Single Item) ─── */}
      <QRCodeModal
        isOpen={Boolean(qrModalItem)}
        item={qrModalItem}
        onClose={() => setQrModalItem(null)}
      />

      {/* ─── Manual Stock Adjustment Modal ─── */}
      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        variants={allVariants}
        initialTarget={selectedTarget}
        onSubmit={handleStockSubmit}
        isPending={adjustMutation.isPending}
      />

      {/* ─── Barcode Scanning & Instant Adjust Modal ─── */}
      <BarcodeScannerModal
        isOpen={barcodeModalOpen}
        onClose={() => setBarcodeModalOpen(false)}
        variants={allVariants}
        onQuickAdjust={handleQuickAdjust}
        isPending={adjustMutation.isPending}
      />
    </div>
  );
}

export default AdminInventoryPage;

