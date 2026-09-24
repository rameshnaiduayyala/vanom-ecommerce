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
      title="Delete / Archive Product"
      description={`Are you sure you want to remove "${deletingProduct?.name}" (SKU: ${deletingProduct?.sku || "N/A"})? This will deactivate the product and variants from the storefront and catalog.`}
      confirmText="Yes, Remove Product"
      variant="danger"
      isLoading={isLoading}
    />
  );
}

export default ProductDeleteConfirm;
