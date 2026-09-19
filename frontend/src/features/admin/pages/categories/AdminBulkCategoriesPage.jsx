import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderTree, Plus, Search, Layers, Edit2, Trash2, Boxes, Sparkles, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { ConfirmDialog } from "@/components/ui/Alert.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Textarea, Checkbox } from "@/components/ui/Input.jsx";
import { Api } from "@/services/api/api-client.js";
import { toast } from "@/components/ui/Toast.jsx";

export function AdminBulkCategoriesPage() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Load master categories and bulk products to calculate product counts
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  const { data: bulkProducts = [] } = useQuery({
    queryKey: ["admin-bulk-products"],
    queryFn: () => Api.b2b.getBulkProducts(),
  });

  // Calculate bulk product counts by category name or id
  const categoryCounts = React.useMemo(() => {
    const counts = {};
    bulkProducts.forEach((p) => {
      const catKey = p.category || p.categoryId || p.categoryName;
      if (catKey) {
        counts[catKey] = (counts[catKey] || 0) + 1;
      }
    });
    return counts;
  }, [bulkProducts]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newCat) => Api.admin.createCategory(newCat),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-categories"] });
      toast.success(
        "B2B Category Created",
        `Category "${created.name || created.data?.name || "Category"}" created successfully.`
      );
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error("Creation Failed", err.message || "Failed to create B2B category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => Api.admin.updateCategory(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-categories"] });
      toast.success(
        "B2B Category Updated",
        `Category "${updated.name || updated.data?.name || "Category"}" updated successfully.`
      );
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error("Update Failed", err.message || "Failed to update B2B category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Api.admin.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-categories"] });
      toast.success("Category Deleted", "Category removed successfully.");
      setDeletingCategory(null);
    },
    onError: (err) => {
      toast.error("Deletion Failed", err.message || "Failed to delete category");
    },
  });

  // Form State
  const defaultForm = {
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(defaultForm);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (val) => {
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({
        ...prev,
        name: val,
        slug: generatedSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
      isActive: Boolean(formData.isActive),
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <span className="font-bold text-[#00875A] uppercase tracking-wider">Wholesale Portal</span>
            <span>•</span>
            <span>B2B Bulk Classification</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-[#00875A]" />
            B2B Bulk Product Categories
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage commercial categories, bulk commodity classifications, and volume catalog taxonomies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="font-bold text-xs bg-[#00875A] hover:bg-[#00734D] text-white shadow-xs cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Add B2B Category
          </Button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search B2B categories by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-[#00875A] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>Total Categories: <strong className="text-text-primary">{categories.length}</strong></span>
          <span>•</span>
          <span>Bulk Items Tagged: <strong className="text-emerald-700">{bulkProducts.length}</strong></span>
        </div>
      </div>

      {/* ─── Categories Grid ─── */}
      {loadingCategories ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-text-muted text-xs">
          <Clock className="w-6 h-6 animate-spin text-[#00875A]" />
          <span>Loading wholesale categories...</span>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const bulkCount = categoryCounts[cat.id] || categoryCounts[cat.name] || 0;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-border p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0 p-1">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <Boxes className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      /{cat.slug}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        {bulkCount} Bulk Commodities
                      </span>
                    </div>
                  </div>
                </div>

                {cat.description && (
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-text-muted font-mono">
                    ID: {cat.id?.slice(0, 8)}...
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(cat)}
                      className="text-[11px] h-7 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-[#00875A]" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeletingCategory(cat)}
                      className="text-[11px] h-7 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 border-rose-200 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-border space-y-3">
          <FolderTree className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No B2B Categories Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No category matching "${searchTerm}". Try another query.`
              : "No categories registered yet. Click 'Add B2B Category' to create your first wholesale taxonomy."}
          </p>
        </div>
      )}

      {/* ─── Add / Edit Modal ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit B2B Category: ${editingCategory.name}` : "Create B2B Wholesale Category"}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
          <Input
            label="Category Name *"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Agricultural Grains & Spices"
            required
          />

          <Input
            label="URL Slug *"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g. agricultural-grains-spices"
            helperText="Used for wholesale catalog URL filtering"
            required
          />

          <div>
            <Input
              label="Banner / Thumbnail Image URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              helperText="Image displayed in B2B wholesale catalog header"
            />
            {formData.imageUrl && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-border">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-10 h-10 rounded-lg object-cover border border-border shrink-0 bg-white"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="text-xs text-text-secondary truncate">
                  <span className="font-semibold block text-text-primary">Image Preview</span>
                  <span className="text-[10px] text-text-muted truncate block">{formData.imageUrl}</span>
                </div>
              </div>
            )}
          </div>

          <Textarea
            label="Wholesale Category Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Commercial commodity scope, export compliance specifications..."
            rows={2}
          />

          <div className="pt-2">
            <Checkbox
              label="Active & Available in B2B Wholesale Catalog"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="font-bold text-xs bg-[#00875A] hover:bg-[#00734D] text-white"
            >
              {editingCategory ? "Save Category Changes" : "Create B2B Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Modal ─── */}
      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
        title="Delete B2B Wholesale Category"
        description={`Are you sure you want to delete category "${deletingCategory?.name}"? Wholesale products tagged under this category may need reclassification.`}
        confirmText="Confirm Deletion"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default AdminBulkCategoriesPage;
