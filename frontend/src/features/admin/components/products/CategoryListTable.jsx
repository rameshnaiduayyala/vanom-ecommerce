import React from "react";
import { Search, FolderTree, Edit2, Trash2 } from "lucide-react";
import { Badge } from "../../../../components/ui/Badge.jsx";
import { Button } from "../../../../components/ui/Button.jsx";

export function CategoryListTable({
  categories = [],
  search = "",
  onSearchChange,
  onEdit,
  onDelete,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full p-8 text-center text-text-muted bg-white rounded-2xl border border-border">
            No categories match your search.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white border border-border hover:border-brand-300 transition-all flex flex-col justify-between gap-4 shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-text-primary text-sm">{cat.name}</h4>
                  </div>
                  <Badge variant="brand" size="sm">
                    {cat.count || 0} Products
                  </Badge>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {cat.description || "Official product category classification."}
                </p>
                <span className="text-[10px] font-mono text-text-secondary bg-surface-muted px-2 py-0.5 rounded mt-2 inline-block">
                  slug: {cat.slug}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit2}
                  onClick={() => onEdit(cat)}
                  className="text-xs cursor-pointer"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => onDelete(cat)}
                  className="text-xs cursor-pointer"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CategoryListTable;
