import React from "react";
import { Modal } from "../../../../components/ui/Modal.jsx";
import { Button } from "../../../../components/ui/Button.jsx";
import { Input, Textarea } from "../../../../components/ui/Input.jsx";

export function CategoryFormModal({
  isOpen,
  onClose,
  editingCategory,
  formData,
  setFormData,
  onSubmit,
  isPending = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? `Edit Category: ${editingCategory.name}` : "Add New Category Taxonomy"}
      maxWidth="max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Category Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Industrial Automation"
          required
        />
        <Input
          label="URL Slug (Optional)"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="e.g. industrial-automation"
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief summary of items in this classification..."
          rows={3}
        />

        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isPending}
            className="font-bold"
          >
            {editingCategory ? "Save Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CategoryFormModal;
