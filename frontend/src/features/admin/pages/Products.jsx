import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { toast } from "../../../components/ui/Toast.jsx";
import { Package, Plus, FolderTree } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { ConfirmDialog } from "../../../components/ui/Alert.jsx";
import { ProductListTable } from "../components/products/ProductListTable.jsx";
import { ProductFormModal } from "../components/products/ProductFormModal.jsx";
import { ProductViewModal } from "../components/products/ProductViewModal.jsx";
import { CategoryListTable } from "../components/products/CategoryListTable.jsx";
import { CategoryFormModal } from "../components/products/CategoryFormModal.jsx";

export { Pricing } from "./Pricing.jsx";

export function Products() {

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'categories'

  // --- Product States ---
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // --- Category States ---
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Product Form Initial State
  const defaultProductForm = {
    name: "",
    sku: "",
    category: "Groceries & FMCG Bulk",
    categoryId: "cat-2",
    brand: "Vanom Brand",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    description: "",
    stock: 1000,
    packaging: {
      unitName: "Sack (25 KG)",
      weightKg: 25,
      dimensionsCm: "60 x 40 x 15",
      palletQuantity: 40,
      palletWeightKg: 1000,
    },
    pricing: {
      IN: {
        currency: "USD",
        symbol: "$",
        retailPrice: 1999,
        moq: 20,
        wholesaleTiers: [
          { minQuantity: 20, maxQuantity: 49, unitPrice: 1750 },
          { minQuantity: 50, maxQuantity: 99, unitPrice: 1550 },
          { minQuantity: 100, maxQuantity: null, unitPrice: 1350 },
        ],
      },
      US: {
        currency: "USD",
        symbol: "$",
        retailPrice: 35.0,
        moq: 20,
        wholesaleTiers: [
          { minQuantity: 20, maxQuantity: 49, unitPrice: 29.0 },
          { minQuantity: 50, maxQuantity: 99, unitPrice: 25.0 },
          { minQuantity: 100, maxQuantity: null, unitPrice: 22.0 },
        ],
      },
      GB: {
        currency: "GBP",
        symbol: "£",
        retailPrice: 28.0,
        moq: 20,
        wholesaleTiers: [
          { minQuantity: 20, maxQuantity: 49, unitPrice: 24.0 },
          { minQuantity: 50, maxQuantity: 99, unitPrice: 21.0 },
          { minQuantity: 100, maxQuantity: null, unitPrice: 18.0 },
        ],
      },
    },
  };

  const [productForm, setProductForm] = useState(defaultProductForm);

  const defaultCategoryForm = {
    name: "",
    slug: "",
    description: "",
  };
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);

  // --- Queries ---
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => Api.admin.getProducts(),
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  // --- Product Mutations ---
  const createProductMutation = useMutation({
    mutationFn: (newProd) => Api.admin.createProduct(newProd),
    onSuccess: (created) => {
      queryClient.invalidateQueries(["admin-products"]);
      queryClient.invalidateQueries(["home-products"]);
      toast.success("Product Created", `${created.name} has been added to the master catalog.`);
      setIsProductModalOpen(false);
      setProductForm(defaultProductForm);
    },
    onError: (err) => toast.error("Creation Failed", err.message),
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => Api.admin.updateProduct(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(["admin-products"]);
      queryClient.invalidateQueries(["home-products"]);
      toast.success("Product Updated", `${updated.name} changes have been saved.`);
      setIsProductModalOpen(false);
      setEditingProduct(null);
    },
    onError: (err) => toast.error("Update Failed", err.message),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => Api.admin.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      queryClient.invalidateQueries(["home-products"]);
      toast.success("Product Deleted", "The product has been removed from the platform.");
      setDeletingProduct(null);
    },
    onError: (err) => toast.error("Deletion Failed", err.message),
  });

  // --- Category Mutations ---
  const createCategoryMutation = useMutation({
    mutationFn: (newCat) => Api.admin.createCategory(newCat),
    onSuccess: (created) => {
      queryClient.invalidateQueries(["admin-categories"]);
      queryClient.invalidateQueries(["home-categories"]);
      toast.success("Category Created", `Category "${created.name}" created successfully.`);
      setIsCategoryModalOpen(false);
      setCategoryForm(defaultCategoryForm);
    },
    onError: (err) => toast.error("Creation Failed", err.message),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => Api.admin.updateCategory(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(["admin-categories"]);
      queryClient.invalidateQueries(["home-categories"]);
      toast.success("Category Updated", `Category "${updated.name}" updated successfully.`);
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    },
    onError: (err) => toast.error("Update Failed", err.message),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => Api.admin.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      queryClient.invalidateQueries(["home-categories"]);
      toast.success("Category Deleted", "Category removed successfully.");
      setDeletingCategory(null);
    },
    onError: (err) => toast.error("Deletion Failed", err.message),
  });

  // Handlers
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(defaultProductForm);
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      ...defaultProductForm,
      ...prod,
      packaging: { ...defaultProductForm.packaging, ...prod.packaging },
      pricing: { ...defaultProductForm.pricing, ...prod.pricing },
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productForm });
    } else {
      createProductMutation.mutate(productForm);
    }
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm(defaultCategoryForm);
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryForm });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" ||
      p.categoryId === selectedCategory ||
      p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Filtered Categories
  const filteredCategories = categories.filter(
    (c) =>
      !categorySearch ||
      c.name?.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.slug?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Master Catalog & Taxonomies</h1>
          <p className="text-xs text-text-muted mt-1">Manage global enterprise products, multi-currency pricing, and category structures.</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "products" ? (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openAddProduct}
              className="font-bold shadow-xs cursor-pointer"
            >
              Add New Product
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openAddCategory}
              className="font-bold shadow-xs cursor-pointer"
            >
              Add New Category
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-border">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 px-1 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "products"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products Catalog</span>
          <Badge variant={activeTab === "products" ? "brand" : "default"} size="sm">
            {products.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 px-1 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "categories"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories & Taxonomies</span>
          <Badge variant={activeTab === "categories" ? "brand" : "default"} size="sm">
            {categories.length}
          </Badge>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "products" ? (
        <ProductListTable
          products={filteredProducts}
          categories={categories}
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onView={(prod) => setViewingProduct(prod)}
          onEdit={openEditProduct}
          onDelete={(prod) => setDeletingProduct(prod)}
        />
      ) : (
        <CategoryListTable
          categories={filteredCategories}
          search={categorySearch}
          onSearchChange={setCategorySearch}
          onEdit={openEditCategory}
          onDelete={(cat) => setDeletingCategory(cat)}
        />
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        formData={productForm}
        setFormData={setProductForm}
        categories={categories}
        onSubmit={handleProductSubmit}
        isPending={createProductMutation.isPending || updateProductMutation.isPending}
      />

      <ProductViewModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        editingCategory={editingCategory}
        formData={categoryForm}
        setFormData={setCategoryForm}
        onSubmit={handleCategorySubmit}
        isPending={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      />

      {/* Delete Product Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => deleteProductMutation.mutate(deletingProduct.id)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action will permanently remove it from the catalog.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteProductMutation.isPending}
      />

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => deleteCategoryMutation.mutate(deletingCategory.id)}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"? All associated taxonomy links may be affected.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}

export default Products;
