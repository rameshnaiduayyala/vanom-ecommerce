import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { toast } from "@/components/ui/Toast.jsx";
import {
  Boxes,
  Plus,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Select } from "@/components/ui/Input.jsx";
import { ConfirmDialog } from "@/components/ui/Alert.jsx";

import { BulkProductList } from "./BulkProductList.jsx";
import { BulkProductFormModal } from "./BulkProductFormModal.jsx";
import { BulkProductViewModal } from "./BulkProductViewModal.jsx";

export function AdminBulkProductsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Queries
  const { data: bulkProducts = [], isLoading: loadingProducts, refetch } = useQuery({
    queryKey: ["admin-bulk-products"],
    queryFn: () => Api.b2b.getBulkProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      try {
        const res = await Api.brands.getBrands();
        return Array.isArray(res) ? res : res?.items || res?.data || [];
      } catch (e) {
        return [];
      }
    },
  });

  const [selectedBrand, setSelectedBrand] = useState("ALL");

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => Api.b2b.createBulkProduct(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["admin-bulk-products"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-bulk-products"] });
      toast.success("Bulk Product Created", `"${created.name || "Bulk Product"}" added to catalog.`);
      setIsModalOpen(false);
    },
    onError: (err) => toast.error("Creation Failed", err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => Api.b2b.updateBulkProduct(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-bulk-products"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-bulk-products"] });
      toast.success("Bulk Product Updated", `"${updated.name || "Bulk Product"}" changes saved.`);
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (err) => toast.error("Update Failed", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Api.b2b.deleteBulkProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bulk-products"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-bulk-products"] });
      toast.success("Bulk Product Deleted", "Wholesale product removed from database.");
      setDeletingProduct(null);
    },
    onError: (err) => toast.error("Deletion Failed", err.message),
  });

  // Action Handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (payload) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Filter products by search, category, and brand
  const filteredProducts = bulkProducts.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());

    const matchedCat = categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory);
    const catId = matchedCat?.id || selectedCategory;
    const catName = (matchedCat?.name || selectedCategory).toLowerCase();

    const matchesCategory =
      selectedCategory === "ALL" ||
      p.categoryId === catId ||
      (p.category || p.categoryName || "").toLowerCase() === catName ||
      (p.category || p.categoryName || "").toLowerCase().includes(catName);

    const matchesBrand =
      selectedBrand === "ALL" ||
      (p.brand || p.originCountry || "").toLowerCase() === selectedBrand.toLowerCase() ||
      (p.brand || p.originCountry || "").toLowerCase().includes(selectedBrand.toLowerCase());

    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-[#00875A]" />
            B2B Bulk Products Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetch()}
            className="cursor-pointer"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreate}
            className="font-bold shadow-xs cursor-pointer"
          >
            Add Bulk Product
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search commodities by title, wholesale SKU, or specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-border bg-surface hover:border-text-muted focus:outline-none focus:border-[#00875A] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { label: "All Wholesale Categories", value: "ALL" },
              ...categories.map((c) => ({ label: c.name, value: c.id })),
            ]}
            className="w-full sm:w-52 text-xs"
          />

          {brands.length > 0 && (
            <Select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              options={[
                { label: "All Brands", value: "ALL" },
                ...brands.map((b) => ({ label: b.name, value: b.name })),
              ]}
              className="w-full sm:w-44 text-xs"
            />
          )}
        </div>
      </div>

      {/* Bulk Products Table Component */}
      <BulkProductList
        products={filteredProducts}
        onView={(p) => setViewingProduct(p)}
        onEdit={(p) => handleOpenEdit(p)}
        onDelete={(p) => setDeletingProduct(p)}
      />

      {/* Add / Edit Form Modal Component */}
      <BulkProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        initialData={editingProduct}
        categories={categories}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* View Wholesale Dossier Modal Component */}
      <BulkProductViewModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
      />

      {/* Delete Confirmation Alert */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => deleteMutation.mutate(deletingProduct.id)}
        title="Delete Wholesale Bulk Product"
        description={`Are you sure you want to permanently delete "${deletingProduct?.name}" (SKU: ${deletingProduct?.sku}) from the dedicated B2B database tables?`}
        confirmText="Yes, Delete Bulk Product"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default AdminBulkProductsPage;
