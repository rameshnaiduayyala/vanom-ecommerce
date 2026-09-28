import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowDownToLine,
  ArrowRightLeft,
  ScanBarcode,
  Layers,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { InventoryTable } from "../InventoryTable.jsx";

export function CatalogView({
  inventoryItems = [],
  filteredInventory = [],
  warehouses = [],
  categories = [],
  isLoading = false,
  searchTerm = "",
  setSearchTerm,
  selectedCategory = "ALL",
  setSelectedCategory,
  selectedWarehouse = "ALL",
  setSelectedWarehouse,
  onOpenAdjust,
  onOpenReceive,
  onOpenTransfer,
  onViewHistory,
  onShowQR,
  onOpenBarcode,
}) {
  const [stockStatusFilter, setStockStatusFilter] = useState("ALL"); // ALL | HEALTHY | LOW | OUT

  // Further refine filtered inventory with stock status quick filter
  const displayedItems = useMemo(() => {
    if (stockStatusFilter === "ALL") return filteredInventory;

    return filteredInventory.filter((row) => {
      const stock = row.quantity !== undefined ? row.quantity : (row.stock || 0);
      const reserved = row.reservedQuantity !== undefined ? row.reservedQuantity : (row.reserved || 0);
      const available = stock - reserved;
      const reorderLvl = row.reorderLevel !== undefined ? row.reorderLevel : 10;

      if (stockStatusFilter === "OUT") {
        return available <= 0;
      }
      if (stockStatusFilter === "LOW") {
        return available > 0 && available <= reorderLvl;
      }
      if (stockStatusFilter === "HEALTHY") {
        return available > reorderLvl;
      }
      return true;
    });
  }, [filteredInventory, stockStatusFilter]);

  return (
    <div className="space-y-4">
      {/* ─── Filter & Quick Action Strip ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border shadow-2xs">
        {/* Left: Search & Dropdown Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, SKU, or brand..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-surface-muted/30 focus:bg-white focus:outline-none focus:border-[#00875A] transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-xl border border-border bg-white px-3 py-2 text-text-primary focus:border-[#00875A] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse Depot Filter */}
          {warehouses.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="text-xs rounded-xl border border-border bg-white px-3 py-2 text-text-primary focus:border-[#00875A] focus:outline-none font-mono cursor-pointer"
              >
                <option value="ALL">All Depots ({warehouses.length})</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-border">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowDownToLine}
            onClick={() => onOpenReceive()}
            className="font-bold border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer shadow-2xs"
          >
            Inward Stock
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={ArrowRightLeft}
            onClick={() => onOpenTransfer()}
            className="font-bold border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer shadow-2xs"
          >
            Transfer
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={ScanBarcode}
            onClick={() => onOpenBarcode()}
            className="font-bold border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            Scan Barcode
          </Button>
        </div>
      </div>

      {/* ─── Status Filter Pills ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pl-1">
          Stock Health:
        </span>
        {[
          { key: "ALL", label: "All Items", count: filteredInventory.length },
          {
            key: "HEALTHY",
            label: "In Stock",
            count: filteredInventory.filter((it) => {
              const avail = (it.quantity || 0) - (it.reservedQuantity || 0);
              return avail > (it.reorderLevel || 10);
            }).length,
          },
          {
            key: "LOW",
            label: "Low Stock",
            count: filteredInventory.filter((it) => {
              const avail = (it.quantity || 0) - (it.reservedQuantity || 0);
              return avail > 0 && avail <= (it.reorderLevel || 10);
            }).length,
          },
          {
            key: "OUT",
            label: "Out of Stock",
            count: filteredInventory.filter((it) => {
              const avail = (it.quantity || 0) - (it.reservedQuantity || 0);
              return avail <= 0;
            }).length,
          },
        ].map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => setStockStatusFilter(pill.key)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              stockStatusFilter === pill.key
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-border text-text-secondary hover:bg-surface-muted"
            }`}
          >
            <span>{pill.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                stockStatusFilter === pill.key
                  ? "bg-white/20 text-white"
                  : "bg-surface-muted text-text-muted"
              }`}
            >
              {pill.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Table Component ─── */}
      <InventoryTable
        items={displayedItems}
        isLoading={isLoading}
        onAdjust={onOpenAdjust}
        onReceive={onOpenReceive}
        onTransfer={onOpenTransfer}
        onViewHistory={onViewHistory}
        onShowQR={onShowQR}
      />

      {/* ─── Footer Details ─── */}
      <div className="flex items-center justify-between text-xs text-text-muted px-2">
        <span>
          Showing <span className="font-semibold text-text-primary">{displayedItems.length}</span> of{" "}
          <span className="font-semibold text-text-primary">{inventoryItems.length}</span> catalog items across{" "}
          <span className="font-semibold text-text-primary">{warehouses.length}</span> depot hub(s)
        </span>
      </div>
    </div>
  );
}

export default CatalogView;
