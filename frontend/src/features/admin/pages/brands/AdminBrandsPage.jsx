import React, { useState } from "react";
import { Tag, Plus, Search, Edit2, Trash2, Globe, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { ConfirmDialog } from "@/components/ui/Alert.jsx";
import { useAdminBrands } from "./hooks/useAdminBrands.js";
import { BrandFormModal } from "./components/BrandFormModal.jsx";

export function AdminBrandsPage() {
  const { brands, isLoading, createMutation, updateMutation, deleteMutation } =
    useAdminBrands();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingBrand) {
      updateMutation.mutate(
        { id: editingBrand.id, data },
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
    if (!deletingBrand) return;
    deleteMutation.mutate(deletingBrand.id, {
      onSuccess: () => setDeletingBrand(null),
    });
  };

  const filteredBrands = brands.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && b.isActive) ||
      (statusFilter === "INACTIVE" && !b.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-[#00875A]" />
            Brand Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage manufacturer labels, brand identities, and product catalog associations.
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
            Add New Brand
          </Button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brands by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-[#00875A] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border text-xs">
            {[
              { label: `All (${brands.length})`, value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 font-medium rounded-lg transition-all ${
                  statusFilter === tab.value
                    ? "bg-white text-text-primary shadow-2xs font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Brands Grid / List ─── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-text-muted text-xs">
          <Clock className="w-6 h-6 animate-spin text-[#00875A]" />
          <span>Loading brand records...</span>
        </div>
      ) : filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white rounded-2xl border border-border p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-4 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                  {brand.imageUrl ? (
                    <img
                      src={brand.imageUrl}
                      alt={brand.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <Tag className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {brand.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    /{brand.slug}
                  </p>
                  <div className="mt-2">
                    <Badge
                      variant={brand.isActive ? "green" : "gray"}
                      size="sm"
                    >
                      {brand.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(brand)}
                  className="text-[11px] h-7 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3 text-[#00875A]" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeletingBrand(brand)}
                  className="text-[11px] h-7 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 border-rose-200 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-border space-y-3">
          <Tag className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No Brands Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No brand matching "${searchTerm}". Try another search term.`
              : "No brands registered yet. Click 'Add New Brand' to create your first manufacturer label."}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="font-bold text-xs bg-[#00875A] hover:bg-[#00734D] text-white mx-auto mt-2"
          >
            Add First Brand
          </Button>
        </div>
      )}

      {/* ─── Add / Edit Modal ─── */}
      <BrandFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingBrand={editingBrand}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* ─── Delete Confirmation Modal ─── */}
      <ConfirmDialog
        isOpen={!!deletingBrand}
        onClose={() => setDeletingBrand(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Brand"
        description={`Are you sure you want to delete brand "${deletingBrand?.name}"? Products linked to this brand may need reassignment.`}
        confirmText="Confirm Deletion"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default AdminBrandsPage;
