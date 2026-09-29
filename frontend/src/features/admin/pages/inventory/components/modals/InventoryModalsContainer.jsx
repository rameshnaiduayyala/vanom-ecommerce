import React from "react";
import { History, X } from "lucide-react";
import { StockAdjustmentModal } from "../StockAdjustmentModal.jsx";
import { ReceiveStockModal } from "../ReceiveStockModal.jsx";
import { StockTransferModal } from "../StockTransferModal.jsx";
import { WarehouseManagementModal } from "../WarehouseManagementModal.jsx";
import { BarcodeScannerModal } from "../BarcodeScannerModal.jsx";
import { QRCodeModal } from "../QRCodeModal.jsx";
import { InventoryHistoryView } from "../InventoryHistoryView.jsx";

/**
 * Encapsulates all global inventory modal dialogs in one isolated container.
 */
export function InventoryModalsContainer({
  modals,
  warehouses,
  inventoryItems,
  allVariants,
  catalogSelectables,
  adjustMutation,
  receiveMutation,
  transferMutation,
  createWarehouseMutation,
  updateWarehouseMutation,
  deleteWarehouseMutation,
}) {
  const {
    adjustModalOpen,
    barcodeModalOpen,
    receiveModalOpen,
    transferModalOpen,
    warehouseModalOpen,
    qrModalItem,
    historyModalItem,
    selectedTarget,
    closeAdjust,
    closeBarcode,
    closeReceive,
    closeTransfer,
    closeWarehouse,
    closeQR,
    closeHistory,
  } = modals;

  const handleStockSubmit = (payload) => {
    adjustMutation.mutate(payload, {
      onSuccess: () => closeAdjust(),
    });
  };

  const handleReceiveSubmit = (payload) => {
    receiveMutation.mutate(payload, {
      onSuccess: () => closeReceive(),
    });
  };

  const handleTransferSubmit = (payload) => {
    transferMutation.mutate(payload, {
      onSuccess: () => closeTransfer(),
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

  return (
    <>
      {/* ─── Receive Stock Modal ─── */}
      <ReceiveStockModal
        isOpen={receiveModalOpen}
        onClose={closeReceive}
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
        onClose={closeTransfer}
        warehouses={warehouses}
        inventoryItems={inventoryItems}
        onSubmit={handleTransferSubmit}
        isPending={transferMutation.isPending}
      />

      {/* ─── Warehouse Hubs Modal ─── */}
      <WarehouseManagementModal
        isOpen={warehouseModalOpen}
        onClose={closeWarehouse}
        warehouses={warehouses}
        onCreate={handleCreateWarehouse}
        onUpdate={handleUpdateWarehouse}
        onDelete={handleDeleteWarehouse}
        isPending={createWarehouseMutation.isPending || updateWarehouseMutation.isPending}
      />

      {/* ─── Manual Stock Adjustment Modal ─── */}
      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={closeAdjust}
        variants={allVariants}
        initialTarget={selectedTarget}
        onSubmit={handleStockSubmit}
        isPending={adjustMutation.isPending}
      />

      {/* ─── Barcode Scanning & Instant Adjust Modal ─── */}
      <BarcodeScannerModal
        isOpen={barcodeModalOpen}
        onClose={closeBarcode}
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

      {/* ─── Single Item Generated QR Code Label Modal ─── */}
      <QRCodeModal
        isOpen={Boolean(qrModalItem)}
        item={qrModalItem}
        onClose={closeQR}
      />

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
                type="button"
                onClick={closeHistory}
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
    </>
  );
}

export default InventoryModalsContainer;
