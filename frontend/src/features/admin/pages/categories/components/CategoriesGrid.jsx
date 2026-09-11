import React from "react";
import { FolderTree, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";

export function CategoriesGrid({ categories, isLoading, onEdit, onDelete, searchTerm }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-border animate-pulse h-44" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-border">
        <FolderTree className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
        <p className="text-sm font-semibold text-text-primary">No categories found</p>
        <p className="text-xs text-text-muted mt-1">
          {searchTerm ? "Try adjusting your search query." : "Get started by adding your first category."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="p-5 rounded-2xl bg-white border border-border hover:border-brand-300 transition-all flex flex-col justify-between gap-4 shadow-2xs group"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-11 h-11 rounded-xl object-cover border border-border shrink-0 bg-surface-muted"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold border border-brand-100 shrink-0">
                    <FolderTree className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-text-primary text-sm leading-tight group-hover:text-brand-700 transition-colors">
                      {cat.name}
                    </h4>
                    {cat.active === false && (
                      <Badge variant="warning" size="sm">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {cat.parentName && (
                    <span className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                      <span>Parent:</span>
                      <span className="font-semibold text-text-secondary">{cat.parentName}</span>
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="brand" size="sm" className="shrink-0 font-bold">
                {cat.count || 0} {cat.count === 1 ? "Product" : "Products"}
              </Badge>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              {cat.description || "Official product taxonomy classification."}
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border/50">
                /{cat.slug}
              </span>
              {cat.sortOrder !== undefined && cat.sortOrder > 0 && (
                <span className="text-[10px] font-mono text-text-muted bg-surface-muted px-2 py-0.5 rounded">
                  Order: {cat.sortOrder}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
              onClick={() => onEdit(cat)}
              className="text-xs font-semibold cursor-pointer"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => onDelete(cat)}
              className="text-xs font-semibold cursor-pointer"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
