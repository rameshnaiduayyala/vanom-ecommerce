import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Boxes,
  Plus,
  Layers,
  CheckCircle2,
  EyeOff,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Pagination } from "@/components/common/Pagination.jsx";
import { ViewProductModal } from "@/features/admin/pages/components/ViewProductModal.jsx";
import { useProducts } from "./hooks/useProducts.js";
import { ProductFilterBar } from "./components/ProductFilterBar.jsx";
import { ProductsTable } from "./components/ProductsTable.jsx";
import { ProductFormModal } from "./components/ProductFormModal.jsx";
import { ProductDeleteConfirm } from "./components/ProductDeleteConfirm.jsx";

export function AdminProductsPage() {
  const {
    products,
    filteredProducts,
    paginatedProducts,
    totalFilteredCount,
    productStats,
    loadingStats,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    categories,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    paginationProps,
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    viewingProduct,
    setViewingProduct,
    deletingProduct,
    setDeletingProduct,
    productForm,
    setProductForm,
    openAddProduct,
    openEditProduct,
    handleProductSubmit,
    deleteProductMutation,
    activateProductMutation,
    warehouses,
    isSubmitting,
    loadingProducts,
    fetchingProducts,
  } = useProducts();

  const stats = productStats || {};
  const statCards = [
    {
      key: "all",
      label: "Total",
      value: stats.total ?? 0,
      icon: Layers,
      iconColor: "text-slate-600",
      bgColor: "bg-slate-100",
      activeClass: "border-slate-400 bg-slate-50 ring-1 ring-slate-300",
      hoverClass: "hover:border-slate-300 hover:bg-slate-50/70",
      title: "Show all products (active + deleted)",
    },
    {
      key: "active",
      label: "Active",
      value: stats.active ?? 0,
      icon: CheckCircle2,
      iconColor: "text-[#00875A]",
      bgColor: "bg-emerald-100/80",
      activeClass: "border-[#00875A] bg-emerald-50/60 ring-1 ring-[#00875A]/30",
      hoverClass: "hover:border-emerald-300 hover:bg-emerald-50/40",
      title: `Active products (${stats.variable ?? 0} variable, ${stats.simple ?? 0} simple)`,
    },
    {
      key: "catalog_items",
      label: "Catalog Items",
      value: stats.catalogItems ?? 0,
      icon: Boxes,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100/80",
      activeClass: "border-purple-400 bg-purple-50/60 ring-1 ring-purple-300",
      hoverClass: "hover:border-purple-300 hover:bg-purple-50/40",
      title: `Total sellable SKUs: ${stats.simple ?? 0} simple products (1 each) + ${stats.totalVariants ?? 0} variants = ${stats.catalogItems ?? 0} catalog items`,
      badge: `${stats.totalVariants ?? 0} var`,
      isInfoOnly: true,
    },
    {
      key: "inactive",
      label: "Inactive",
      value: stats.inactive ?? 0,
      icon: EyeOff,
      iconColor: "text-zinc-600",
      bgColor: "bg-zinc-200/70",
      activeClass: "border-zinc-400 bg-zinc-50 ring-1 ring-zinc-300",
      hoverClass: "hover:border-zinc-300 hover:bg-zinc-50/70",
      title: "Inactive / unpublished products (not deleted)",
    },
    {
      key: "deleted",
      label: "Deleted",
      value: stats.deleted ?? 0,
      icon: Trash2,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-100/80",
      activeClass: "border-rose-400 bg-rose-50/70 ring-1 ring-rose-300",
      hoverClass: "hover:border-rose-300 hover:bg-rose-50/40",
      title: "Soft-deleted / archived products",
    },
    {
      key: "out_of_stock",
      label: "Out of Stock",
      value: stats.outOfStock ?? 0,
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-100/80",
      activeClass: "border-amber-400 bg-amber-50/70 ring-1 ring-amber-300",
      hoverClass: "hover:border-amber-300 hover:bg-amber-50/40",
      title: `Out of stock products (${stats.lowStock ?? 0} low stock ≤10 units)`,
      badge: stats.lowStock > 0 ? `+${stats.lowStock} low` : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header: Title + Small Smart KPI Cards + Add Button */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
              <Package className="w-6 h-6 text-[#00875A]" />
              Products Catalog
            </h1>
          </div>

          {/* Smart Catalog Stat Cards */}
          <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
            {statCards.map((card) => {
              const Icon = card.icon;
              const isSelected = !card.isInfoOnly && statusFilter === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  title={card.title}
                  onClick={() => {
                    if (card.isInfoOnly) return;
                    setStatusFilter(isSelected && card.key !== "active" ? "active" : card.key);
                  }}
                  className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-xl border bg-white text-left transition-all shadow-2xs ${
                    card.isInfoOnly ? "cursor-default" : "cursor-pointer"
                  } ${
                    isSelected
                      ? card.activeClass
                      : `border-slate-200 ${card.isInfoOnly ? "" : card.hoverClass}`
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${card.bgColor}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
                  </div>
                  <div className="leading-none pr-0.5">
                    <div className="flex items-center gap-1.5">
                      {loadingStats ? (
                        <span className="inline-block w-5 h-3.5 bg-slate-200 rounded animate-pulse" />
                      ) : (
                        <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                          {card.value}
                        </span>
                      )}
                      {!loadingStats && card.badge && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-800">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mt-0.5">
                      {card.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/admin/products/new">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              className="font-bold shadow-xs cursor-pointer"
            >
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Management */}
      <div className="space-y-4">
        {/* Filter Bar */}
        <ProductFilterBar
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          totalProductsCount={totalFilteredCount}
        />

        {/* Products Table */}
        <ProductsTable
          products={paginatedProducts}
          isLoading={loadingProducts}
          isFetching={fetchingProducts}
          onViewProduct={setViewingProduct}
          onEditProduct={openEditProduct}
          onDeleteProduct={setDeletingProduct}
          onActivateProduct={(p) => activateProductMutation.mutate(p.id)}
          activatingProductId={
            activateProductMutation.isPending ? activateProductMutation.variables : null
          }
        />

        {/* Reusable Table Pagination */}
        <Pagination
          {...paginationProps}
          itemName="products"
        />
      </div>

      {/* Quick Edit/Add Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        categories={categories}
        warehouses={warehouses}
        onSubmit={handleProductSubmit}
        isSubmitting={isSubmitting}
      />

      {/* View Product Details Modal */}
      <ViewProductModal
        productId={viewingProduct?.id || viewingProduct?.slug}
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
      />

      {/* Delete Confirmation */}
      <ProductDeleteConfirm
        deletingProduct={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={(id) => deleteProductMutation.mutate(id)}
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
}

export default AdminProductsPage;
