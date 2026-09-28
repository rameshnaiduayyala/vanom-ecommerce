import { useState, useCallback } from "react";

/**
 * Custom hook to manage all inventory modal states in one place,
 * decoupling modal visibility and target selection from the main page view.
 */
export function useInventoryModals(allVariants = []) {
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);

  const [qrModalItem, setQrModalItem] = useState(null);
  const [historyModalItem, setHistoryModalItem] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedWarehouseForEdit, setSelectedWarehouseForEdit] = useState(null);

  const openAdjust = useCallback((row = null) => {
    if (row) {
      const matchedVariant = allVariants.find(
        (v) => v.id === row.id || v.productId === row.id || v.inventoryId === row.id
      );
      setSelectedTarget(matchedVariant || { productId: row.id, id: row.id, inventoryId: row.id });
    } else {
      setSelectedTarget(allVariants[0] || null);
    }
    setAdjustModalOpen(true);
  }, [allVariants]);

  const openReceive = useCallback((row = null) => {
    setSelectedTarget(row);
    setReceiveModalOpen(true);
  }, []);

  const openTransfer = useCallback((row = null) => {
    setSelectedTarget(row);
    setTransferModalOpen(true);
  }, []);

  const openWarehouse = useCallback((warehouse = null) => {
    setSelectedWarehouseForEdit(warehouse);
    setWarehouseModalOpen(true);
  }, []);

  const openBarcode = useCallback(() => {
    setBarcodeModalOpen(true);
  }, []);

  const openQR = useCallback((row) => {
    setQrModalItem(row);
  }, []);

  const openHistory = useCallback((row) => {
    setHistoryModalItem(row);
  }, []);

  const closeAdjust = useCallback(() => setAdjustModalOpen(false), []);
  const closeBarcode = useCallback(() => setBarcodeModalOpen(false), []);
  const closeReceive = useCallback(() => setReceiveModalOpen(false), []);
  const closeTransfer = useCallback(() => setTransferModalOpen(false), []);
  const closeWarehouse = useCallback(() => {
    setWarehouseModalOpen(false);
    setSelectedWarehouseForEdit(null);
  }, []);
  const closeQR = useCallback(() => setQrModalItem(null), []);
  const closeHistory = useCallback(() => setHistoryModalItem(null), []);

  return {
    // Visibility states
    adjustModalOpen,
    barcodeModalOpen,
    receiveModalOpen,
    transferModalOpen,
    warehouseModalOpen,
    qrModalItem,
    historyModalItem,
    selectedTarget,
    selectedWarehouseForEdit,

    // Open handlers
    openAdjust,
    openReceive,
    openTransfer,
    openWarehouse,
    openBarcode,
    openQR,
    openHistory,

    // Close handlers
    closeAdjust,
    closeBarcode,
    closeReceive,
    closeTransfer,
    closeWarehouse,
    closeQR,
    closeHistory,
  };
}
