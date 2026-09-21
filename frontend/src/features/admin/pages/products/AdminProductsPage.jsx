import React from "react";
import { Link } from "react-router-dom";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
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
    categories,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
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
    isSubmitting,
  } = useProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Package className="w-6 h-6 text-[#00875A]" />
            Products Catalog
          </h1>
        </div>

        <div className="flex items-center gap-3">
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
          totalProductsCount={products.length}
        />

        {/* Products Table */}
        <ProductsTable
          products={filteredProducts}
          onViewProduct={setViewingProduct}
          onEditProduct={openEditProduct}
          onDeleteProduct={setDeletingProduct}
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
