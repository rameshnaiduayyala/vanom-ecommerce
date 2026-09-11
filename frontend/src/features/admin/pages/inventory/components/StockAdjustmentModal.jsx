import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Select } from "@/components/ui/Input.jsx";

export function StockAdjustmentModal({
  isOpen,
  onClose,
  variants = [],
  onSubmit,
  isPending,
  initialTarget = null,
}) {
  const [formData, setFormData] = useState({
    productId: initialTarget?.productId || "",
    variantId: initialTarget?.id || "",
    quantity: 50,
    type: "ADJUSTMENT",
    reason: "Routine Stock Replenishment",
  });

  // Keep state synced when initialTarget changes
  React.useEffect(() => {
    if (initialTarget) {
      setFormData((prev) => ({
        ...prev,
        productId: initialTarget.productId || "",
        variantId: initialTarget.id || "",
      }));
    } else if (variants.length > 0 && !formData.variantId) {
      setFormData((prev) => ({
        ...prev,
        productId: variants[0].productId || "",
        variantId: variants[0].id || "",
      }));
    }
  }, [initialTarget, variants]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      productId: formData.productId,
      variantId: formData.variantId,
      quantity: Number(formData.quantity),
      type: formData.type,
      reason: formData.reason,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Level Adjustment"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Select
          label="Target Product / Variant"
          value={formData.variantId || formData.productId}
          onChange={(e) => {
            const selectedVar = variants.find((v) => v.id === e.target.value);
            setFormData({
              ...formData,
              variantId: e.target.value,
              productId: selectedVar?.productId || e.target.value,
            });
          }}
          options={variants.map((v) => ({
            label: `${v.name} (${v.sku})`,
            value: v.id,
          }))}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantity Change (+/-)"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
          />

          <Select
            label="Movement Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { label: "Stock Adjustment", value: "ADJUSTMENT" },
              { label: "Purchase Restock", value: "PURCHASE" },
              { label: "Return Processing", value: "RETURN" },
              { label: "Damage Write-off", value: "DAMAGE" },
            ]}
          />
        </div>

        <Input
          label="Audit Reason / Reference"
          value={formData.reason}
          onChange={(e) =>
            setFormData({ ...formData, reason: e.target.value })
          }
          placeholder="e.g. Monthly inventory stock reconciliation"
          required
        />

        <div className="pt-3 border-t border-border flex justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isPending}
            className="font-bold"
          >
            Commit Stock Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default StockAdjustmentModal;
