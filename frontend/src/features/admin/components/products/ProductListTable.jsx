import React from "react";
import { Search, Eye, Edit2, Trash2 } from "lucide-react";
import { Badge } from "../../../../components/ui/Badge.jsx";

export function ProductListTable({
  products = [],
  categories = [],
  search = "",
  onSearchChange,
  selectedCategory = "ALL",
  onCategoryChange,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by SKU, name or brand..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="p-2 rounded-xl border border-border bg-white text-xs text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
              <tr>
                <th className="p-4">Product Info</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Inventory Stock</th>
                <th className="p-4">Retail Price (IN / US / GB)</th>
                <th className="p-4">Wholesale MOQ</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-text-muted">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"}
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-cover border border-border shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-text-primary leading-tight max-w-xs">{p.name}</h4>
                          <span className="text-[10px] text-text-muted">{p.brand || "Vanom"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-text-secondary">{p.sku}</td>
                    <td className="p-4">
                      <Badge variant="default" size="sm">
                        {p.category}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${p.stock < 500 ? "text-amber-600" : "text-emerald-700"}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 font-semibold">
                      ${p.pricing?.IN?.retailPrice || 0} • ${p.pricing?.US?.retailPrice || 0} • £{p.pricing?.GB?.retailPrice || 0}
                    </td>
                    <td className="p-4 font-mono font-bold text-gold-600">
                      {p.pricing?.IN?.moq || p.packaging?.palletQuantity || 20} {p.packaging?.unitName?.split(" ")[0] || "units"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onView(p)}
                          className="p-1.5 text-text-muted hover:text-brand-600 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 text-text-muted hover:text-blue-600 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Product"
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
    </div>
  );
}

export default ProductListTable;
