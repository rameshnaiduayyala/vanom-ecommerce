import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  RefreshCw,
  ArrowRightLeft,
  ScanBarcode,
  Printer,
  Warehouse,
  ArrowDownToLine,
  Sliders,
  History,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { useAdminInventory } from "./hooks/useAdminInventory.js";
import { InventoryMetrics } from "./components/InventoryMetrics.jsx";
import { InventoryFilter } from "./components/InventoryFilter.jsx";
import { InventoryTable } from "./components/InventoryTable.jsx";
import { StockAdjustmentModal } from "./components/StockAdjustmentModal.jsx";
import { BarcodeScannerModal } from "./components/BarcodeScannerModal.jsx";
import { QRCodeModal } from "./components/QRCodeModal.jsx";
import { ReceiveStockModal } from "./components/ReceiveStockModal.jsx";
import { StockTransferModal } from "./components/StockTransferModal.jsx";
import { WarehouseManagementModal } from "./components/WarehouseManagementModal.jsx";
import { InventoryHistoryView } from "./components/InventoryHistoryView.jsx";

export function AdminInventoryPage() {
  const navigate = useNavigate();
  const {
    inventoryItems,
    filteredInventory,
    warehouses,
    categories,
    allVariants,
    catalogSelectables,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedWarehouse,
    setSelectedWarehouse,
    adjustMutation,
    receiveMutation,
    transferMutation,
    createWarehouseMutation,
    updateWarehouseMutation,
    deleteWarehouseMutation,
    metrics,
  } = useAdminInventory();

  // Active view tab: "catalog" | "history" | "alerts"
  const [activeTab, setActiveTab] = useState("catalog");

  // Modals state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [qrModalItem, setQrModalItem] = useState(null);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [historyModalItem, setHistoryModalItem] = useState(null);

  const handleOpenAdjust = (row = null) => {
    if (row) {
      const matchedVariant = allVariants.find(
        (v) => v.id === row.id || v.productId === row.id || v.inventoryId === row.id
      );
      setSelectedTarget(matchedVariant || { productId: row.id, id: row.id, inventoryId: row.id });
    } else {
      setSelectedTarget(allVariants[0] || null);
    }
    setAdjustModalOpen(true);
  };

  const handleOpenReceive = (row = null) => {
    setSelectedTarget(row);
    setReceiveModalOpen(true);
  };

  const handleOpenTransfer = (row = null) => {
    setSelectedTarget(row);
    setTransferModalOpen(true);
  };

  const handleViewHistory = (row) => {
    setHistoryModalItem(row);
  };

  const handleStockSubmit = (payload) => {
    adjustMutation.mutate(payload, {
      onSuccess: () => setAdjustModalOpen(false),
    });
  };

  const handleReceiveSubmit = (payload) => {
    receiveMutation.mutate(payload, {
      onSuccess: () => setReceiveModalOpen(false),
    });
  };

  const handleTransferSubmit = (payload) => {
    transferMutation.mutate(payload, {
      onSuccess: () => setTransferModalOpen(false),
    });
  };

  const handleCreateWarehouse = (data, cb) => {
    createWarehouseMutation.mutate(data, {
      onSuccess: () => {
        if (cb) cb();
      },
    });
  };

  const handleUpdateWarehouse = (id, data, cb) => {
    updateWarehouseMutation.mutate({ id, data }, {
      onSuccess: () => {
        if (cb) cb();
      },
    });
  };

  const handleDeleteWarehouse = (id) => {
    deleteWarehouseMutation.mutate(id);
  };

  // Filtered rows for alerts tab (low or out of stock)
  const alertItems = filteredInventory.filter((item) => {
    const stock = item.quantity !== undefined ? item.quantity : (item.stock || 0);
    const reserved = item.reservedQuantity !== undefined ? item.reservedQuantity : (item.reserved || 0);
    const avail = stock - reserved;
    return avail <= (item.reorderLevel || 10);
  });

  return (
    <div className="space-y-6">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-[#00875A]" />
            Enterprise Multi-Depot Inventory Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time multi-warehouse stock balances, atomic checkout locks, Dual-Ledger transfers, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Warehouse}
            onClick={() => setWarehouseModalOpen(true)}
            className="font-bold border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer shadow-2xs"
          >
            Manage Depots ({warehouses.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={ArrowDownToLine}
            onClick={() => handleOpenReceive()}
            className="font-bold border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer shadow-2xs"
          >
            Inward / Receive Stock
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={ArrowRightLeft}
            onClick={() => handleOpenTransfer()}
            className="font-bold border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer shadow-2xs"
          >
            Transfer Stock
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => navigate("/admin/inventory/print")}
            className="font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer shadow-2xs"
          >
            Barcode Studio
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={ScanBarcode}
            onClick={() => setBarcodeModalOpen(true)}
            className="font-bold border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            Terminal Scan
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
        </div>
      </div>

      {/* ─── Metric KPI Cards ─── */}
      <InventoryMetrics metrics={metrics} />

      {/* ─── Navigation Tabs ─── */}
      <div className="flex items-center gap-1 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === "catalog"
              ? "bg-[#00875A] text-white"
              : "text-text-secondary hover:bg-surface-muted"
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          Warehouse Inventory Catalog ({filteredInventory.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === "history"
              ? "bg-[#00875A] text-white"
              : "text-text-secondary hover:bg-surface-muted"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Transaction Audit Trail Ledger
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === "alerts"
              ? "bg-rose-600 text-white"
              : "text-rose-700 hover:bg-rose-50"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Reorder & Out-of-Stock Alerts ({alertItems.length})
        </button>
      </div>

      {/* ─── TAB 1: Catalog View ─── */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <InventoryFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              totalCount={filteredInventory.length}
            />

            {warehouses.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-secondary uppercase whitespace-nowrap">
                  Filter Depot:
                </span>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
                >
                  <option value="ALL">All Warehouse Hubs ({warehouses.length})</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <InventoryTable
            items={filteredInventory}
            isLoading={isLoading}
            onAdjust={handleOpenAdjust}
            onReceive={handleOpenReceive}
            onTransfer={handleOpenTransfer}
            onViewHistory={handleViewHistory}
            onShowQR={(row) => setQrModalItem(row)}
          />
        </div>
      )}

      {/* ─── TAB 2: Audit History View ─── */}
      {activeTab === "history" && (
        <InventoryHistoryView />
      )}

      {/* ─── TAB 3: Low & Out of Stock Alerts ─── */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                These items are currently at or below their minimum reorder thresholds. Inward stock immediately to prevent fulfillment backorders.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowDownToLine}
              onClick={() => handleOpenReceive()}
              className="bg-white border-amber-300 font-bold"
            >
              Restock All
            </Button>
          </div>

          <InventoryTable
            items={alertItems}
            isLoading={isLoading}
            onAdjust={handleOpenAdjust}
            onReceive={handleOpenReceive}
            onTransfer={handleOpenTransfer}
            onViewHistory={handleViewHistory}
            onShowQR={(row) => setQrModalItem(row)}
          />
        </div>
      )}

      {/* ─── Single Item Audit History Modal ─── */}
      {historyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl border border-border max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <div>
                  <h2 className="text-base font-bold text-text-primary">
                    Audit Trail Ledger: {historyModalItem.product?.name || historyModalItem.name}
                  </h2>
                  <p className="text-xs text-text-muted">
                    SKU: {historyModalItem.variant?.sku || historyModalItem.product?.sku || historyModalItem.sku} | Depot: {historyModalItem.warehouse?.code || "GLOBAL"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalItem(null)}
                className="p-1 rounded-lg text-text-muted hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 pt-4">
              <InventoryHistoryView inventoryId={historyModalItem.id} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Generated QR Code Label Modal ─── */}
      <QRCodeModal
        isOpen={Boolean(qrModalItem)}
        item={qrModalItem}
        onClose={() => setQrModalItem(null)}
      />

      {/* ─── Receive Stock Modal ─── */}
      <ReceiveStockModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        warehouses={warehouses}
        inventoryItems={inventoryItems}
        catalogItems={catalogSelectables}
        initialTarget={selectedTarget}
        onSubmit={handleReceiveSubmit}
        isPending={receiveMutation.isPending}
      />

      {/* ─── Stock Transfer Modal ─── */}
      <StockTransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        warehouses={warehouses}
        inventoryItems={inventoryItems}
        onSubmit={handleTransferSubmit}
        isPending={transferMutation.isPending}
      />

      {/* ─── Warehouse Hubs Modal ─── */}
      <WarehouseManagementModal
        isOpen={warehouseModalOpen}
        onClose={() => setWarehouseModalOpen(false)}
        warehouses={warehouses}
        onCreate={handleCreateWarehouse}
        onUpdate={handleUpdateWarehouse}
        onDelete={handleDeleteWarehouse}
        isPending={createWarehouseMutation.isPending || updateWarehouseMutation.isPending}
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
        onQuickAdjust={(payload, onComplete) => {
          adjustMutation.mutate(payload, {
            onSuccess: () => {
              if (onComplete) onComplete();
            },
          });
        }}
        isPending={adjustMutation.isPending}
      />
    </div>
  );
}

export default AdminInventoryPage;


