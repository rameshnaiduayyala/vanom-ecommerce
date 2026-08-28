import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice } from "../../../utils/formatters.js";
import { toast } from "../../../components/ui/Toast.jsx";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Layers,
  Boxes,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Input, Textarea, Select } from "../../../components/ui/Input.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import { ConfirmDialog, EmptyState } from "../../../components/ui/Alert.jsx";

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
        currency: "INR",
        symbol: "₹",
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

  // Category Form Initial State
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
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Master Catalog & Taxonomies</h1>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "products" ? (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openAddProduct}
              className="font-bold shadow-xs"
            >
              Add New Product
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openAddCategory}
              className="font-bold shadow-xs"
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
          className={`pb-3 px-1 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
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
          className={`pb-3 px-1 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
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

      {/* ============================================================
          TAB 1: PRODUCTS MANAGEMENT
      ============================================================ */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by SKU, name or brand..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-text-muted">
                        No products match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
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
                          ₹{p.pricing?.IN?.retailPrice || 0} • ${p.pricing?.US?.retailPrice || 0} • £{p.pricing?.GB?.retailPrice || 0}
                        </td>
                        <td className="p-4 font-mono font-bold text-gold-600">
                          {p.pricing?.IN?.moq || p.packaging?.palletQuantity || 20} {p.packaging?.unitName?.split(" ")[0] || "units"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingProduct(p)}
                              className="p-1.5 text-text-muted hover:text-brand-600 rounded-lg hover:bg-surface-muted transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditProduct(p)}
                              className="p-1.5 text-text-muted hover:text-blue-600 rounded-lg hover:bg-surface-muted transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(p)}
                              className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
      )}

      {/* ============================================================
          TAB 2: CATEGORIES MANAGEMENT
      ============================================================ */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories by name or slug..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
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
                    onClick={() => openEditCategory(cat)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeletingCategory(cat)}
                    className="text-xs"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: ADD / EDIT PRODUCT
      ============================================================ */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Enterprise Product"}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleProductSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          {/* General Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
              1. Basic Product Attributes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Title"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="e.g. Royal Heritage Aged Basmati Rice (25 KG Sack)"
                required
              />
              <Input
                label="SKU Code"
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                placeholder="e.g. FMCG-RICE-25KG"
                required
              />
              <Select
                label="Category Taxonomy"
                value={productForm.categoryId}
                onChange={(e) => {
                  const sel = categories.find((c) => c.id === e.target.value);
                  setProductForm({
                    ...productForm,
                    categoryId: e.target.value,
                    category: sel ? sel.name : productForm.category,
                  });
                }}
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
              />
              <Input
                label="Brand / Manufacturer"
                value={productForm.brand}
                onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                placeholder="e.g. Vanom Pantry"
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Product Image URL"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Description & Specifications"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Provide detailed commercial and retail specifications..."
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing & Regional Tiers */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
              2. Multi-Market Retail Prices & MOQ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-3">
                <span className="text-xs font-bold text-text-primary block">🇮🇳 India (INR • ₹)</span>
                <Input
                  label="Retail Price (₹)"
                  type="number"
                  value={productForm.pricing.IN.retailPrice}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      pricing: {
                        ...productForm.pricing,
                        IN: { ...productForm.pricing.IN, retailPrice: parseFloat(e.target.value) || 0 },
                      },
                    })
                  }
                  required
                />
                <Input
                  label="Wholesale MOQ (units)"
                  type="number"
                  value={productForm.pricing.IN.moq}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      pricing: {
                        ...productForm.pricing,
                        IN: { ...productForm.pricing.IN, moq: parseInt(e.target.value) || 1 },
                      },
                    })
                  }
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-3">
                <span className="text-xs font-bold text-text-primary block">🇺🇸 United States (USD • $)</span>
                <Input
                  label="Retail Price ($)"
                  type="number"
                  step="0.01"
                  value={productForm.pricing.US.retailPrice}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      pricing: {
                        ...productForm.pricing,
                        US: { ...productForm.pricing.US, retailPrice: parseFloat(e.target.value) || 0 },
                      },
                    })
                  }
                  required
                />
                <Input
                  label="Wholesale MOQ (units)"
                  type="number"
                  value={productForm.pricing.US.moq}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      pricing: {
                        ...productForm.pricing,
                        US: { ...productForm.pricing.US, moq: parseInt(e.target.value) || 1 },
                      },
                    })
                  }
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-3">
                <span className="text-xs font-bold text-text-primary block">🇬🇧 United Kingdom (GBP • £)</span>
                <Input
                  label="Retail Price (£)"
                  type="number"
                  step="0.01"
                  value={productForm.pricing.GB.retailPrice}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      pricing: {
                        ...productForm.pricing,
                        GB: { ...productForm.pricing.GB, retailPrice: parseFloat(e.target.value) || 0 },
                      },
                    })
                  }
                  required
                />
                <Input
                  label="Wholesale MOQ (units)"
                  type="number"
                  value={productForm.pricing.GB.moq}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      pricing: {
                        ...productForm.pricing,
                        GB: { ...productForm.pricing.GB, moq: parseInt(e.target.value) || 1 },
                      },
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Logistics & Pallet Specifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
              3. Packaging & Pallet Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="Unit Packaging"
                value={productForm.packaging.unitName}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    packaging: { ...productForm.packaging, unitName: e.target.value },
                  })
                }
                placeholder="e.g. Sack (25 KG)"
                required
              />
              <Input
                label="Unit Weight (KG)"
                type="number"
                value={productForm.packaging.weightKg}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    packaging: { ...productForm.packaging, weightKg: parseFloat(e.target.value) || 0 },
                  })
                }
                required
              />
              <Input
                label="Pallet Capacity (Units)"
                type="number"
                value={productForm.packaging.palletQuantity}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    packaging: { ...productForm.packaging, palletQuantity: parseInt(e.target.value) || 1 },
                  })
                }
                required
              />
              <Input
                label="Initial Stock"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createProductMutation.isPending || updateProductMutation.isPending}
              className="font-bold"
            >
              {editingProduct ? "Save Product Changes" : "Publish Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          MODAL: VIEW PRODUCT DETAILS
      ============================================================ */}
      <Modal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        title="Product Inspection & Logistics Dossier"
        maxWidth="max-w-2xl"
      >
        {viewingProduct && (
          <div className="space-y-6 text-xs text-text-primary">
            <div className="flex gap-4 items-start">
              <img
                src={viewingProduct.image}
                alt={viewingProduct.name}
                className="w-24 h-24 rounded-xl object-cover border border-border shrink-0"
              />
              <div className="space-y-1">
                <Badge variant="brand" size="sm">
                  {viewingProduct.category}
                </Badge>
                <h3 className="text-base font-bold text-text-primary">{viewingProduct.name}</h3>
                <p className="text-text-muted font-mono">SKU: {viewingProduct.sku}</p>
                <p className="text-text-secondary leading-relaxed pt-1">{viewingProduct.description}</p>
              </div>
            </div>

            {/* Packaging & Logistics Box */}
            <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2">
              <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                Logistics & Pallet Specifications
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-text-muted block text-[10px]">Packaging</span>
                  <span className="font-semibold">{viewingProduct.packaging?.unitName}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Unit Weight</span>
                  <span className="font-semibold">{viewingProduct.packaging?.weightKg} KG</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Units / Pallet</span>
                  <span className="font-bold text-brand-700">{viewingProduct.packaging?.palletQuantity} Units</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Stock Available</span>
                  <span className="font-bold text-emerald-700">{viewingProduct.stock}</span>
                </div>
              </div>
            </div>

            {/* Wholesale Price Tiers */}
            <div className="space-y-2">
              <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                Regional Wholesale Tier Pricing
              </h5>
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-surface-muted text-[11px] uppercase font-semibold">
                    <tr>
                      <th className="p-3">Country</th>
                      <th className="p-3">Retail Price</th>
                      <th className="p-3">Wholesale MOQ</th>
                      <th className="p-3">Tier 3 (Max Volume)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-semibold">India (INR)</td>
                      <td className="p-3 font-bold text-text-primary">₹{viewingProduct.pricing?.IN?.retailPrice}</td>
                      <td className="p-3 font-mono">{viewingProduct.pricing?.IN?.moq || 20}</td>
                      <td className="p-3 font-bold text-gold-600">₹{viewingProduct.pricing?.IN?.wholesaleTiers?.[2]?.unitPrice || 1750}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">United States (USD)</td>
                      <td className="p-3 font-bold text-text-primary">${viewingProduct.pricing?.US?.retailPrice}</td>
                      <td className="p-3 font-mono">{viewingProduct.pricing?.US?.moq || 20}</td>
                      <td className="p-3 font-bold text-gold-600">${viewingProduct.pricing?.US?.wholesaleTiers?.[2]?.unitPrice || 28.0}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">United Kingdom (GBP)</td>
                      <td className="p-3 font-bold text-text-primary">£{viewingProduct.pricing?.GB?.retailPrice}</td>
                      <td className="p-3 font-mono">{viewingProduct.pricing?.GB?.moq || 20}</td>
                      <td className="p-3 font-bold text-gold-600">£{viewingProduct.pricing?.GB?.wholesaleTiers?.[2]?.unitPrice || 22.5}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================
          MODAL: ADD / EDIT CATEGORY
      ============================================================ */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : "Add New Category Taxonomy"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="e.g. Industrial Automation"
            required
          />
          <Input
            label="URL Slug (Optional)"
            value={categoryForm.slug}
            onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
            placeholder="e.g. industrial-automation"
          />
          <Textarea
            label="Description"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            placeholder="Category scope and supported product types..."
            rows={3}
          />

          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              className="font-bold"
            >
              {editingCategory ? "Save Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          CONFIRM DELETE DIALOGS
      ============================================================ */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => deleteProductMutation.mutate(deletingProduct.id)}
        title="Delete Master Product"
        description={`Are you sure you want to permanently delete "${deletingProduct?.name}" (SKU: ${deletingProduct?.sku})? This product will immediately become unavailable on both B2C and B2B portals.`}
        confirmText="Yes, Delete Product"
        variant="danger"
        isLoading={deleteProductMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => deleteCategoryMutation.mutate(deletingCategory.id)}
        title="Delete Category Taxonomy"
        description={`Are you sure you want to delete category "${deletingCategory?.name}"?`}
        confirmText="Confirm Deletion"
        variant="danger"
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}

export function Pricing() {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Regional Wholesale Pricing Engine</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">India (INR • ₹)</h3>
            <Badge variant="brand" size="sm">Active Matrix</Badge>
          </div>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between py-1 border-b border-border">
              <span>Standard Retail Price</span>
              <strong className="text-text-primary">₹2,499 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 1 (20 - 49 units)</span>
              <strong className="text-gold-600 font-bold">₹2,150 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 2 (50 - 99 units)</span>
              <strong className="text-gold-600 font-bold">₹1,950 / unit</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Tier 3 (100+ units)</span>
              <strong className="text-gold-600 font-bold">₹1,750 / unit</strong>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">United States (USD • $)</h3>
            <Badge variant="brand" size="sm">Active Matrix</Badge>
          </div>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between py-1 border-b border-border">
              <span>Standard Retail Price</span>
              <strong className="text-text-primary">$42.00 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 1 (20 - 49 units)</span>
              <strong className="text-gold-600 font-bold">$35.00 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 2 (50 - 99 units)</span>
              <strong className="text-gold-600 font-bold">$31.50 / unit</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Tier 3 (100+ units)</span>
              <strong className="text-gold-600 font-bold">$28.00 / unit</strong>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">United Kingdom (GBP • £)</h3>
            <Badge variant="brand" size="sm">Active Matrix</Badge>
          </div>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between py-1 border-b border-border">
              <span>Standard Retail Price</span>
              <strong className="text-text-primary">£34.00 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 1 (20 - 49 units)</span>
              <strong className="text-gold-600 font-bold">£28.50 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 2 (50 - 99 units)</span>
              <strong className="text-gold-600 font-bold">£25.50 / unit</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Tier 3 (100+ units)</span>
              <strong className="text-gold-600 font-bold">£22.50 / unit</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
