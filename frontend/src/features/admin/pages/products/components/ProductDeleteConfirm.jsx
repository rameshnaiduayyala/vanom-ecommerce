import { ConfirmDialog } from "@/components/ui/Alert.jsx";

export function ProductDeleteConfirm({
  deletingProduct,
  onClose,
  onConfirm,
  isLoading,
}) {
  return (
    <ConfirmDialog
      isOpen={Boolean(deletingProduct)}
      onClose={onClose}
      onConfirm={() => onConfirm(deletingProduct?.id)}
      title="Delete Master Product"
      description={`Are you sure you want to permanently delete "${deletingProduct?.name}" (SKU: ${deletingProduct?.sku})? This product will immediately become unavailable on both B2C and B2B portals.`}
      confirmText="Yes, Delete Product"
      variant="danger"
      isLoading={isLoading}
    />
  );
}

export default ProductDeleteConfirm;
