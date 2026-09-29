import React, { useState, useEffect } from "react";
import { X, Warehouse, Plus, Edit2, Trash2, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";

export function WarehouseManagementModal({
  isOpen,
  onClose,
  warehouses = [],
  onCreate,
  onUpdate,
  onDelete,
  isPending = false,
}) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    address: "",
    isActive: true,
  });

  useEffect(() => {
    if (!isOpen) {
      setEditingId(null);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      address: "",
      isActive: true,
    });
    setEditingId(null);
  };

  const handleEditClick = (wh) => {
    setEditingId(wh.id);
    setFormData({
      name: wh.name || "",
      code: wh.code || "",
      city: wh.city || "",
      state: wh.state || "",
      country: wh.country || "India",
      postalCode: wh.postalCode || "",
      address: wh.address || "",
      isActive: wh.isActive !== false,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (editingId) {
      onUpdate(editingId, formData, () => resetForm());
    } else {
      onCreate(formData, () => resetForm());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Warehouse Hub Management</h2>
              <p className="text-xs text-text-muted">Configure multi-tenant fulfillment centers and depot locations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 py-4 space-y-6">
          {/* Create or Edit Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-surface-muted/60 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                {editingId ? <Edit2 className="w-3.5 h-3.5 text-blue-600" /> : <Plus className="w-3.5 h-3.5 text-emerald-600" />}
                {editingId ? "Edit Warehouse Depot" : "Add New Warehouse Depot"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] text-text-muted hover:text-text-primary underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase mb-1">
                  Depot Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hyderabad Central Hub"
                  className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase mb-1">
                  Depot Code * (Unique)
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. HYD-01"
                  className="w-full text-xs font-mono font-bold rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Hyderabad"
                  className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase mb-1">
                  State / Region
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Telangana"
                  className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. India"
                  className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="e.g. 500081"
                  className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase mb-1">
                  Address Line
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. HITEC City Phase 2"
                  className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary font-medium">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[#00875A] focus:ring-0"
                />
                Depot Active & Open for Orders
              </label>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isPending || !formData.name || !formData.code}
                className="font-bold bg-[#00875A] hover:bg-[#00704A]"
              >
                {isPending ? "Saving..." : editingId ? "Save Changes" : "Create Warehouse Depot"}
              </Button>
            </div>
          </form>

          {/* List of existing warehouses */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5" /> Active Depot Network ({warehouses.length})
            </h3>

            <div className="space-y-2">
              {warehouses.map((wh) => (
                <div
                  key={wh.id}
                  className="p-3.5 rounded-xl border border-border bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center font-mono font-bold text-xs text-text-primary border border-border shrink-0">
                      {wh.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-text-primary">{wh.name}</span>
                        <Badge variant={wh.isActive !== false ? "success" : "default"} size="sm">
                          {wh.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {[wh.city, wh.state, wh.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(wh)}
                      className="text-xs text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    {onDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to deactivate warehouse "${wh.name}"?`)) {
                            onDelete(wh.id);
                          }
                        }}
                        className="text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-border shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
