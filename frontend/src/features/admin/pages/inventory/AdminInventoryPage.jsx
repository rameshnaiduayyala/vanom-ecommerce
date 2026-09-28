import React, { useState } from "react";
import {
  Boxes,
  RefreshCw,
  ScanBarcode,
  ArrowRightLeft,
  Warehouse,
  ArrowDownToLine,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { useAdminInventory } from "./hooks/useAdminInventory.js";
import { useInventoryModals } from "./hooks/useInventoryModals.js";

// Components
import { InventoryMetrics } from "./components/InventoryMetrics.jsx";
import { InventoryTabsHeader } from "./components/InventoryTabsHeader.jsx";
import { InventoryHistoryView } from "./components/InventoryHistoryView.jsx";
import { InventoryModalsContainer } from "./components/modals/InventoryModalsContainer.jsx";

// Views
import { CatalogView } from "./components/views/CatalogView.jsx";
import { StockOperationsView } from "./components/views/StockOperationsView.jsx";
import { WarehouseHubsView } from "./components/views/WarehouseHubsView.jsx";
import { StockAlertsView } from "./components/views/StockAlertsView.jsx";
import { BarcodeStudioView } from "./components/views/BarcodeStudioView.jsx";

export function AdminInventoryPage() {
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

  // Active top-level workspace tab
  const [activeTab, setActiveTab] = useState("catalog");

  // Modal states hook (separated concern)
  const modals = useInventoryModals(allVariants);

  // Compute alert items (at or below reorder threshold)
  const alertItems = filteredInventory.filter((item) => {
    const stock = item.quantity !== undefined ? item.quantity : (item.stock || 0);
    const reserved = item.reservedQuantity !== undefined ? item.reservedQuantity : (item.reserved || 0);
    const avail = stock - reserved;
    return avail <= (item.reorderLevel || 10);
  });

  return (
    <div className="space-y-5">
      {/* ─── 1. Header & Quick Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-[#00875A]" />
            Enterprise Multi-Depot Inventory Hub
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time stock balance matrix, dual-ledger movements, atomic checkout reservations, and immutable audit logs.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ScanBarcode}
            onClick={modals.openBarcode}
            className="font-bold border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            Quick Scan
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetch()}
            disabled={isLoading}
            className={`cursor-pointer ${isLoading ? "animate-spin text-text-muted" : ""}`}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ─── 2. Metric KPI Cards ─── */}
      <InventoryMetrics metrics={metrics} />

      {/* ─── 3. Modular Workspace Tabs Navigation ─── */}
      <InventoryTabsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        catalogCount={inventoryItems.length}
        warehouseCount={warehouses.length}
        alertCount={alertItems.length}
      />

      {/* ─── 4. Tab Views (Separated Concerns) ─── */}
      <main>
        {/* Tab 1: Stock Catalog */}
        {activeTab === "catalog" && (
          <CatalogView
            inventoryItems={inventoryItems}
            filteredInventory={filteredInventory}
            warehouses={warehouses}
            categories={categories}
            isLoading={isLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedWarehouse={selectedWarehouse}
            setSelectedWarehouse={setSelectedWarehouse}
            onOpenAdjust={modals.openAdjust}
            onOpenReceive={modals.openReceive}
            onOpenTransfer={modals.openTransfer}
            onViewHistory={modals.openHistory}
            onShowQR={modals.openQR}
            onOpenBarcode={modals.openBarcode}
          />
        )}

        {/* Tab 2: Stock Operations (Inward, Transfer, Adjust) */}
        {activeTab === "operations" && (
          <StockOperationsView
            warehouses={warehouses}
            inventoryItems={inventoryItems}
            catalogItems={catalogSelectables}
            allVariants={allVariants}
            onReceiveSubmit={receiveMutation.mutate}
            onTransferSubmit={transferMutation.mutate}
            onAdjustSubmit={adjustMutation.mutate}
            isPending={
              receiveMutation.isPending ||
              transferMutation.isPending ||
              adjustMutation.isPending
            }
          />
        )}

        {/* Tab 3: Depot Hubs & Warehouse Management */}
        {activeTab === "warehouses" && (
          <WarehouseHubsView
            warehouses={warehouses}
            inventoryItems={inventoryItems}
            onCreateWarehouse={createWarehouseMutation.mutate}
            onUpdateWarehouse={(id, data, cb) => {
              updateWarehouseMutation.mutate({ id, data }, { onSuccess: cb });
            }}
            onDeleteWarehouse={deleteWarehouseMutation.mutate}
            onOpenReceive={modals.openReceive}
            onOpenTransfer={modals.openTransfer}
            isPending={
              createWarehouseMutation.isPending ||
              updateWarehouseMutation.isPending ||
              deleteWarehouseMutation.isPending
            }
          />
        )}

        {/* Tab 4: Reorder & Low-Stock Alerts */}
        {activeTab === "alerts" && (
          <StockAlertsView
            alertItems={alertItems}
            isLoading={isLoading}
            onOpenReceive={modals.openReceive}
            onOpenAdjust={modals.openAdjust}
            onOpenTransfer={modals.openTransfer}
            onViewHistory={modals.openHistory}
            onShowQR={modals.openQR}
          />
        )}

        {/* Tab 5: Transaction Audit Trail Ledger */}
        {activeTab === "history" && (
          <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs">
            <InventoryHistoryView />
          </div>
        )}

        {/* Tab 6: Barcode & QR Label Studio */}
        {activeTab === "barcodes" && (
          <BarcodeStudioView
            allVariants={allVariants}
            onOpenBarcodeModal={modals.openBarcode}
            onQuickAdjust={(payload, onComplete) => {
              adjustMutation.mutate(payload, {
                onSuccess: () => {
                  if (onComplete) onComplete();
                },
              });
            }}
            isPending={adjustMutation.isPending}
          />
        )}
      </main>

      {/* ─── 5. Modal Dialogs Container (Separated Concern) ─── */}
      <InventoryModalsContainer
        modals={modals}
        warehouses={warehouses}
        inventoryItems={inventoryItems}
        allVariants={allVariants}
        catalogSelectables={catalogSelectables}
        adjustMutation={adjustMutation}
        receiveMutation={receiveMutation}
        transferMutation={transferMutation}
        createWarehouseMutation={createWarehouseMutation}
        updateWarehouseMutation={updateWarehouseMutation}
        deleteWarehouseMutation={deleteWarehouseMutation}
      />
    </div>
  );
}

export default AdminInventoryPage;
