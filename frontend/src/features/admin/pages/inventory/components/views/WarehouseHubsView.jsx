import React, { useState } from "react";
import {
  Warehouse,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle2,
  Boxes,
  ArrowDownToLine,
  ArrowRightLeft,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";

export function WarehouseHubsView({
  warehouses = [],
  inventoryItems = [],
  onCreateWarehouse,
  onUpdateWarehouse,
  onDeleteWarehouse,
  onOpenReceive,
  onOpenTransfer,
  isPending = false,
}) {
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
    setEditingWarehouse(null);
    setIsCreateOpen(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleStartEdit = (wh) => {
    setEditingWarehouse(wh);
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
    setIsCreateOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (editingWarehouse) {
      onUpdateWarehouse(editingWarehouse.id, formData, () => resetForm());
    } else {
      onCreateWarehouse(formData, () => resetForm());
    }
  };

  // Compute stats per warehouse
  const warehouseStats = warehouses.map((wh) => {
    const items = inventoryItems.filter((it) => it.warehouseId === wh.id);
    const totalUnits = items.reduce((sum, it) => sum + (it.quantity !== undefined ? it.quantity : (it.stock || 0)), 0);
    const reservedUnits = items.reduce((sum, it) => sum + (it.reservedQuantity !== undefined ? it.reservedQuantity : (it.reserved || 0)), 0);

    return {
      ...wh,
      itemCount: items.length,
      totalUnits,
      reservedUnits,
      availableUnits: Math.max(0, totalUnits - reservedUnits),
    };
  });

  return (
    <div className="space-y-6">
      {/* ─── Header & Add Action ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Enterprise Depot & Fulfillment Centers ({warehouses.length})
            </h2>
            <p className="text-xs text-text-muted">
              Configure physical distribution hubs, geo-routing coordinates, and live depot stock density.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={handleStartCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer shadow-2xs"
        >
          Register New Depot
        </Button>
      </div>

      {/* ─── Create / Edit Slide-Down Form ─── */}
      {isCreateOpen && (
        <div className="bg-purple-50/40 border border-purple-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-purple-200 pb-3">
            <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-purple-600" />
              {editingWarehouse ? `Edit Depot: ${editingWarehouse.name}` : "Register New Fulfillment Depot"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-text-muted hover:text-text-primary cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Depot Code *</label>
                <input
                  type="text"
                  placeholder="e.g. DEL-HUB-01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-border bg-white p-2.5 font-mono uppercase focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Depot / Hub Name *</label>
                <input
                  type="text"
                  placeholder="e.g. North Delhi Central Depot"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-white p-2.5 focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">City *</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-border bg-white p-2.5 focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">State / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi NCR"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-xl border border-border bg-white p-2.5 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-text-primary mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="Plot 42, Logistics Park Sector 18"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-border bg-white p-2.5 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Postal Code</label>
                <input
                  type="text"
                  placeholder="110001"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full rounded-xl border border-border bg-white p-2.5 font-mono focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full rounded-xl border border-border bg-white p-2.5 focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                Depot is active and accepts incoming orders & stock
              </label>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {isPending ? "Saving Depot..." : editingWarehouse ? "Update Depot" : "Create Depot"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── Depot Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouseStats.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-text-muted bg-white rounded-2xl border border-border">
            No warehouses registered yet. Click "Register New Depot" above to establish your primary hub.
          </div>
        ) : (
          warehouseStats.map((wh) => (
            <div
              key={wh.id}
              className="bg-white rounded-2xl border border-border p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              {/* Top Row: Code, Name, Status */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 inline-block">
                      {wh.code}
                    </span>
                    <h3 className="font-bold text-sm text-text-primary mt-2">{wh.name}</h3>
                  </div>

                  <Badge variant={wh.isActive !== false ? "success" : "default"} size="sm">
                    {wh.isActive !== false ? "Active Hub" : "Inactive"}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-start gap-1.5 text-xs text-text-muted mt-2.5">
                  <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                  <span>
                    {[wh.address, wh.city, wh.state, wh.country, wh.postalCode].filter(Boolean).join(", ") ||
                      "Location unspecified"}
                  </span>
                </div>
              </div>

              {/* Stock Density Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-muted/50 border border-border text-center">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">SKUs</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{wh.itemCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">On-Hand</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {wh.totalUnits.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Available</span>
                  <span className="font-mono font-bold text-[#00875A] text-xs">
                    {wh.availableUnits.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(wh)}
                    title="Edit Depot Settings"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer text-xs flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {onDeleteWarehouse && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to deactivate depot ${wh.code}?`)) {
                          onDeleteWarehouse(wh.id);
                        }
                      }}
                      title="Deactivate Depot"
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {onOpenReceive && (
                    <button
                      type="button"
                      onClick={() => onOpenReceive({ warehouseId: wh.id })}
                      title="Inward to this depot"
                      className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer text-xs font-bold flex items-center gap-1"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Inward</span>
                    </button>
                  )}

                  {onOpenTransfer && (
                    <button
                      type="button"
                      onClick={() => onOpenTransfer({ warehouseId: wh.id })}
                      title="Transfer from this depot"
                      className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer text-xs font-bold flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WarehouseHubsView;
