import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice } from "@/utils/formatters.js";
import { toast } from "@/components/ui/Toast.jsx";
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Layers,
  DollarSign,
  Package,
  Sparkles,
  RefreshCw,
  Building2,
  AlertCircle,
  Truck,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Input, Textarea, Select } from "@/components/ui/Input.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { ConfirmDialog } from "@/components/ui/Alert.jsx";

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

  // Default Form State for Bulk Product
  const defaultForm = {
    name: "",
    sku: "",
    description: "",
    categoryId: "",
    moq: 20,
    packagingType: "25 KG Poly Sacks",
    unitsPerPackage: 1,
    packagesPerPallet: 40,
    leadTimeDays: 2,
    originCountry: "India",
    basePriceUSD: 25.0,
    basePriceCAD: 33.75,
    basePriceINR: 1800,
    stockQuantity: 5000,
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
    wholesaleTiers: [
      {
        tierNumber: 1,
        name: "Tier 1 (Base MOQ)",
        minQuantity: 20,
        maxQuantity: 100,
        discountPercent: 0,
        unitPriceUSD: 25.0,
        unitPriceCAD: 33.75,
        unitPriceINR: 1800,
      },
      {
        tierNumber: 2,
        name: "Tier 2 (Case Bulk)",
        minQuantity: 101,
        maxQuantity: 500,
        discountPercent: 12,
        unitPriceUSD: 22.0,
        unitPriceCAD: 29.7,
        unitPriceINR: 1584,
      },
      {
        tierNumber: 3,
        name: "Tier 3 (Pallet / Container)",
        minQuantity: 501,
        maxQuantity: null,
        discountPercent: 25,
        unitPriceUSD: 18.75,
        unitPriceCAD: 25.3,
        unitPriceINR: 1350,
      },
    ],
  };

  const [form, setForm] = useState(defaultForm);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => Api.b2b.createBulkProduct(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["admin-bulk-products"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-bulk-products"] });
      toast.success("Bulk Product Created", `"${created.name || "Bulk Product"}" added to B2B wholesale catalog.`);
      setIsModalOpen(false);
      setForm(defaultForm);
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

  // Handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm({
      ...defaultForm,
      categoryId: categories[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || "",
      sku: p.sku || "",
      description: p.description || "",
      categoryId: p.categoryId || (categories[0]?.id || ""),
      moq: p.moq || 20,
      packagingType: p.packaging?.type || "25 KG Poly Sacks",
      unitsPerPackage: p.packaging?.unitsPerPackage || 1,
      packagesPerPallet: p.packaging?.packagesPerPallet || 40,
      leadTimeDays: p.leadTimeDays || 2,
      originCountry: p.originCountry || "India",
      basePriceUSD: p.basePriceUSD || 25.0,
      basePriceCAD: p.basePriceCAD || 33.75,
      basePriceINR: p.basePriceINR || 1800,
      stockQuantity: p.stockQuantity || 5000,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : defaultForm.images,
      wholesaleTiers: Array.isArray(p.wholesaleTiers) && p.wholesaleTiers.length > 0 ? p.wholesaleTiers : defaultForm.wholesaleTiers,
    });
    setIsModalOpen(true);
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...form.wholesaleTiers];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, wholesaleTiers: updated });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      moq: parseInt(form.moq, 10) || 20,
      unitsPerPackage: parseInt(form.unitsPerPackage, 10) || 1,
      packagesPerPallet: parseInt(form.packagesPerPallet, 10) || 40,
      leadTimeDays: parseInt(form.leadTimeDays, 10) || 2,
      basePriceUSD: parseFloat(form.basePriceUSD) || 25.0,
      basePriceCAD: parseFloat(form.basePriceCAD) || 33.75,
      basePriceINR: parseFloat(form.basePriceINR) || 1800,
      stockQuantity: parseInt(form.stockQuantity, 10) || 5000,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Filtered List
  const filteredProducts = bulkProducts.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" ||
      p.categoryId === selectedCategory ||
      p.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <span className="font-bold text-[#00875A] uppercase tracking-wider">Private Wholesale Engine</span>
            <span>•</span>
            <span>Dedicated bulkProduct Table</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-[#00875A]" />
            B2B Bulk Products Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Dedicated CRUD for high-volume wholesale commodities, pallet configurations, container lead times, and multi-tier MOQ schedules.
          </p>
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bulk products by SKU, commodity name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:border-[#00875A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-xl border border-border bg-white text-xs text-text-primary font-medium focus:outline-none focus:border-[#00875A]"
          >
            <option value="ALL">All Master Categories ({bulkProducts.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Products Table */}
      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
              <tr>
                <th className="p-4">Commodity Info</th>
                <th className="p-4">Bulk SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Packaging & Pallet Spec</th>
                <th className="p-4">Wholesale MOQ</th>
                <th className="p-4">Base Tier Price</th>
                <th className="p-4">Lead Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-text-muted">
                    No bulk products found. Click "+ Add Bulk Product" to create your first wholesale commodity.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"}
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-cover border border-border shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-text-primary leading-tight max-w-xs">{p.name}</h4>
                          <span className="text-[10px] text-emerald-700 font-semibold">Private B2B Direct</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-text-secondary">{p.sku}</td>
                    <td className="p-4">
                      <Badge variant="default" size="sm">
                        {p.categoryName || "General"}
                      </Badge>
                    </td>
                    <td className="p-4 text-text-secondary">
                      <div className="font-semibold text-text-primary">{p.packaging?.type || "25 KG Sack"}</div>
                      <div className="text-[10px] text-text-muted">
                        {p.packaging?.packagesPerPallet || 40} packages/pallet ({p.packaging?.palletCapacityUnits || 1000} units)
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-700">
                      {p.moq} units
                    </td>
                    <td className="p-4 font-bold text-text-primary">
                      ${p.basePriceUSD || 0} USD • CA${p.basePriceCAD || 0}
                    </td>
                    <td className="p-4 text-text-muted font-medium">
                      {p.leadTimeDays || 2} Days
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingProduct(p)}
                          className="p-1.5 text-text-muted hover:text-[#00875A] rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                          title="View Tier Specs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-text-muted hover:text-blue-600 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                          title="Edit Bulk Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Bulk Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          MODAL: ADD / EDIT BULK PRODUCT
      ============================================================ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Bulk Product: ${editingProduct.name}` : "Create Dedicated B2B Wholesale Commodity"}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          {/* Section 1: Basic Specifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00875A] border-b border-border pb-1">
              1. Wholesale Commodity Identity & Category
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bulk Product Title"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Royal Heritage Aged Basmati Rice (25 KG Poly Sacks)"
                required
              />
              <Input
                label="Wholesale SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. BLK-RICE-25KG"
                required
              />
              <Select
                label="Master Category"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
                required
              />
              <Input
                label="Country of Origin"
                value={form.originCountry}
                onChange={(e) => setForm({ ...form, originCountry: e.target.value })}
                placeholder="e.g. India / USA"
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Wholesale Product Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter bulk packaging, purity certification, moisture specs..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pallet & Packaging Logistics */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00875A] border-b border-border pb-1">
              2. Pallet, Packaging & MOQ Logistics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Packaging Type"
                  value={form.packagingType}
                  onChange={(e) => setForm({ ...form, packagingType: e.target.value })}
                  placeholder="e.g. 25 KG Poly Sack / Master Carton"
                  required
                />
              </div>
              <Input
                label="Minimum Order Qty (MOQ)"
                type="number"
                min="1"
                value={form.moq}
                onChange={(e) => setForm({ ...form, moq: e.target.value })}
                required
              />
              <Input
                label="Lead Time (Days)"
                type="number"
                min="1"
                value={form.leadTimeDays}
                onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
              />
              <Input
                label="Units / Package"
                type="number"
                min="1"
                value={form.unitsPerPackage}
                onChange={(e) => setForm({ ...form, unitsPerPackage: e.target.value })}
              />
              <Input
                label="Packages / Pallet"
                type="number"
                min="1"
                value={form.packagesPerPallet}
                onChange={(e) => setForm({ ...form, packagesPerPallet: e.target.value })}
              />
              <Input
                label="Total Warehouse Stock (Units)"
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Base Multi-Currency Pricing */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00875A] border-b border-border pb-1">
              3. Base Wholesale Pricing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="USD Base Price ($)"
                type="number"
                step="0.01"
                value={form.basePriceUSD}
                onChange={(e) => setForm({ ...form, basePriceUSD: e.target.value })}
                required
              />
              <Input
                label="CAD Base Price (CA$)"
                type="number"
                step="0.01"
                value={form.basePriceCAD}
                onChange={(e) => setForm({ ...form, basePriceCAD: e.target.value })}
              />
              <Input
                label="INR Base Price (₹)"
                type="number"
                step="1"
                value={form.basePriceINR}
                onChange={(e) => setForm({ ...form, basePriceINR: e.target.value })}
              />
            </div>
          </div>

          {/* Section 4: Tiered Volume Discount Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00875A] border-b border-border pb-1">
              4. Tiered Volume Discount Break Schedules (BulkTierPrice Table)
            </h4>
            <div className="space-y-2.5">
              {form.wholesaleTiers.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                  <div className="font-bold text-xs text-slate-800">{t.name}</div>
                  <Input
                    label="Min Qty"
                    type="number"
                    value={t.minQuantity}
                    onChange={(e) => handleTierChange(idx, "minQuantity", e.target.value)}
                  />
                  <Input
                    label="Max Qty (null for +)"
                    value={t.maxQuantity ?? ""}
                    onChange={(e) => handleTierChange(idx, "maxQuantity", e.target.value ? parseInt(e.target.value) : null)}
                  />
                  <Input
                    label="Disc %"
                    type="number"
                    value={t.discountPercent}
                    onChange={(e) => handleTierChange(idx, "discountPercent", e.target.value)}
                  />
                  <Input
                    label="USD Unit Price"
                    type="number"
                    step="0.01"
                    value={t.unitPriceUSD}
                    onChange={(e) => handleTierChange(idx, "unitPriceUSD", e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="font-bold cursor-pointer"
            >
              {editingProduct ? "Save Changes" : "Create Bulk Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          MODAL: VIEW BULK PRODUCT DETAILS
      ============================================================ */}
      {viewingProduct && (
        <Modal
          isOpen={Boolean(viewingProduct)}
          onClose={() => setViewingProduct(null)}
          title={`Wholesale Dossier: ${viewingProduct.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">SKU</span>
                <span className="font-mono font-bold text-slate-800">{viewingProduct.sku}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">MOQ</span>
                <span className="font-bold text-amber-700">{viewingProduct.moq} Units</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Pallet Spec</span>
                <span className="font-bold text-slate-800">{viewingProduct.packaging?.packagesPerPallet || 40} Packages</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Origin</span>
                <span className="font-bold text-slate-800">{viewingProduct.originCountry}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-2">Quantity Break Tier Schedules:</h5>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Tier Level</th>
                      <th className="p-2.5">Volume Range</th>
                      <th className="p-2.5">Discount %</th>
                      <th className="p-2.5">USD Price</th>
                      <th className="p-2.5">CAD Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewingProduct.wholesaleTiers?.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">{t.name}</td>
                        <td className="p-2.5 font-mono">{t.minQuantity} - {t.maxQuantity || "Above"} units</td>
                        <td className="p-2.5 text-gold-600 font-bold">{t.discountPercent}%</td>
                        <td className="p-2.5 font-bold text-emerald-800">${t.unitPriceUSD}</td>
                        <td className="p-2.5 font-bold text-blue-800">CA${t.unitPriceCAD}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewingProduct(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
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
