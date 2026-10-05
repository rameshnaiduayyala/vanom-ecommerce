import React, { useState } from "react";
import { FolderTree, Plus, GitFork } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { ConfirmDialog } from "@/components/ui/Alert.jsx";
import { useAdminCategories } from "./hooks/useAdminCategories.js";
import { CategoriesFilter } from "./components/CategoriesFilter.jsx";
import { CategoriesGrid } from "./components/CategoriesGrid.jsx";
import { CategoryHierarchyView } from "./components/CategoryHierarchyView.jsx";
import { CategoryFormModal } from "./components/CategoryFormModal.jsx";

export function AdminCategoriesPage() {
  const { categories, isLoading, createMutation, updateMutation, deleteMutation } =
    useAdminCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("hierarchy"); // "hierarchy" | "grid"
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenAddSubcategory = (parentCategory) => {
    setEditingCategory({ parentId: parentCategory.id });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleToggleExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] !== undefined ? !prev[categoryId] : false,
    }));
  };

  const handleExpandAll = () => {
    const next = {};
    categories.forEach((c) => {
      if (!c.parentId) next[c.id] = true;
    });
    setExpandedCategories(next);
  };

  const handleCollapseAll = () => {
    const next = {};
    categories.forEach((c) => {
      if (!c.parentId) next[c.id] = false;
    });
    setExpandedCategories(next);
  };

  const handleFormSubmit = (data) => {
    if (editingCategory?.id) {
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
            Organize catalog departments, parent categories, and child subcategories with sort orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
            className="font-bold shadow-xs cursor-pointer bg-[#00875A] hover:bg-[#006B3C] text-white"
          >
            Add New Category
          </Button>
        </div>
      </div>

      {/* ─── Search, View Mode & Filters Bar ─── */}
      <CategoriesFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={categories.length}
        filteredCount={filteredCategories.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      {/* ─── Categories View: Hierarchy Tree vs Grid ─── */}
      {viewMode === "hierarchy" ? (
        <CategoryHierarchyView
          categories={filteredCategories}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={setDeletingCategory}
          onAddSubcategory={handleOpenAddSubcategory}
          searchTerm={searchTerm}
          expandedCategories={expandedCategories}
          onToggleExpand={handleToggleExpand}
        />
      ) : (
        <CategoriesGrid
          categories={filteredCategories}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={setDeletingCategory}
          searchTerm={searchTerm}
        />
      )}

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
