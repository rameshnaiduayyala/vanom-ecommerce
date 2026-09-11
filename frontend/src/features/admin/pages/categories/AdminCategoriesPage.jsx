import React, { useState } from "react";
import { FolderTree, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { ConfirmDialog } from "@/components/ui/Alert.jsx";
import { useAdminCategories } from "./hooks/useAdminCategories.js";
import { CategoriesFilter } from "./components/CategoriesFilter.jsx";
import { CategoriesGrid } from "./components/CategoriesGrid.jsx";
import { CategoryFormModal } from "./components/CategoryFormModal.jsx";

export function AdminCategoriesPage() {
  const { categories, isLoading, createMutation, updateMutation, deleteMutation } =
    useAdminCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, data },
        {
          onSuccess: () => setIsModalOpen(false),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingCategory) return;
    deleteMutation.mutate(deletingCategory.id, {
      onSuccess: () => setDeletingCategory(null),
    });
  };

  const filteredCategories = categories.filter(
    (c) =>
      !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-[#00875A]" />
            Categories & Taxonomies
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage storefront product classifications, hierarchical parent-child taxonomies, and ordering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
            className="font-bold shadow-xs cursor-pointer"
          >
            Add New Category
          </Button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <CategoriesFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={categories.length}
        filteredCount={filteredCategories.length}
      />

      {/* ─── Categories Grid ─── */}
      <CategoriesGrid
        categories={filteredCategories}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={setDeletingCategory}
        searchTerm={searchTerm}
      />

      {/* ─── Add / Edit Modal ─── */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCategory={editingCategory}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        categories={categories}
      />

      {/* ─── Delete Confirmation Modal ─── */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category Taxonomy"
        description={`Are you sure you want to delete category "${deletingCategory?.name}"? Products attached to this category may need reclassification.`}
        confirmText="Confirm Deletion"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default AdminCategoriesPage;
