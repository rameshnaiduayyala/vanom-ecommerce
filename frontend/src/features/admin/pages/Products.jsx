import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  Image as ImageIcon,
  Tag,
  Sparkles,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Input, Textarea, Select, Checkbox } from "../../../components/ui/Input.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import { ConfirmDialog, EmptyState } from "../../../components/ui/Alert.jsx";
import { ViewProductModal } from "./components/ViewProductModal.jsx";

export function Products() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "categories" ? "categories" : "products");

  useEffect(() => {
    if (tabParam === "categories") {
      setActiveTab("categories");
    } else if (tabParam === "products" || !tabParam) {
      setActiveTab("products");
    }
  }, [tabParam]);

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
    description: "",
    categoryId: "",
    category: "",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    oldPrice: "",
    priceUS: "",
    priceCA: "",
    isBestSeller: false,
    isNewProduct: true,
    isFeatured: false,
    stock: 100,
    sku: "",
  };

  const [productForm, setProductForm] = useState(defaultProductForm);

  // Category Form Initial State
  const defaultCategoryForm = {
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    parentId: "",
    active: true,
    sortOrder: 0,
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
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
      toast.success("Product Created", `${created.name || "Product"} has been added to the master catalog.`);
      setIsProductModalOpen(false);
      setProductForm(defaultProductForm);
    },
    onError: (err) => toast.error("Creation Failed", err.message),
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => Api.admin.updateProduct(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
      toast.success("Product Updated", `${updated.name || "Product"} changes have been saved.`);
      setIsProductModalOpen(false);
      setEditingProduct(null);
    },
    onError: (err) => toast.error("Update Failed", err.message),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => Api.admin.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
      toast.success("Product Deleted", "The product has been removed from the platform.");
      setDeletingProduct(null);
    },
    onError: (err) => toast.error("Deletion Failed", err.message),
  });

  // --- Category Mutations ---
  const createCategoryMutation = useMutation({
    mutationFn: (newCat) => Api.admin.createCategory(newCat),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["home-categories"] });
      toast.success("Category Created", `Category "${created.name || created.data?.name || "New Category"}" created successfully.`);
      setIsCategoryModalOpen(false);
      setCategoryForm(defaultCategoryForm);
    },
    onError: (err) => toast.error("Creation Failed", err.message || "Failed to create category"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => Api.admin.updateCategory(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["home-categories"] });
      toast.success("Category Updated", `Category "${updated.name || updated.data?.name || "Category"}" updated successfully.`);
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    },
    onError: (err) => toast.error("Update Failed", err.message || "Failed to update category"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => Api.admin.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["home-categories"] });
      toast.success("Category Deleted", "Category removed successfully.");
      setDeletingCategory(null);
    },
    onError: (err) => toast.error("Deletion Failed", err.message || "Failed to delete category"),
  });

  // Handlers
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      ...defaultProductForm,
      categoryId: categories[0]?.id || "",
    });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || "",
      description: prod.description || "",
      categoryId: prod.categoryId || prod.categories?.[0]?.categoryId || "",
      category: prod.category || "",
      image: prod.image || prod.images?.[0]?.file?.url || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      oldPrice: prod.oldPrice || "",
      priceUS: prod.priceUS || prod.pricing?.US?.retailPrice || "",
      priceCA: prod.priceCA || prod.pricing?.CA?.retailPrice || "",
      isBestSeller: Boolean(prod.isBestSeller),
      isNewProduct: Boolean(prod.isNewProduct),
      isFeatured: Boolean(prod.isFeatured),
      stock: prod.stock || 100,
      sku: prod.sku || "",
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      priceUS: parseFloat(productForm.priceUS) || 0,
      priceCA: productForm.priceCA ? parseFloat(productForm.priceCA) : undefined,
      oldPrice: productForm.oldPrice ? parseFloat(productForm.oldPrice) : undefined,
      stock: parseInt(productForm.stock, 10) || 100,
    };
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createProductMutation.mutate(payload);
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
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      parentId: cat.parentId || "",
      active: cat.active !== undefined ? cat.active : true,
      sortOrder: cat.sortOrder || 0,
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategoryNameChange = (val) => {
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setCategoryForm((prev) => ({
        ...prev,
        name: val,
        slug: generatedSlug,
      }));
    } else {
      setCategoryForm((prev) => ({ ...prev, name: val }));
    }
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: categoryForm.name.trim(),
      slug: categoryForm.slug?.trim() || undefined,
      description: categoryForm.description?.trim() || undefined,
      imageUrl: categoryForm.imageUrl?.trim() || undefined,
      parentId: categoryForm.parentId || undefined,
      active: Boolean(categoryForm.active),
      sortOrder: Number(categoryForm.sortOrder) || 0,
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

  // Safely normalized arrays
  const productList = Array.isArray(products) ? products : (products?.items || []);
  const categoryList = Array.isArray(categories) ? categories : (categories?.items || []);

  // Filtered Products
  const filteredProducts = productList.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      (typeof p.category === "string" && p.category?.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" ||
      p.categoryId === selectedCategory ||
      p.category === selectedCategory ||
      (typeof p.category === "object" && p.category?.id === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Filtered Categories
  const filteredCategories = categoryList.filter(
    (c) =>
      !categorySearch ||
      c.name?.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.slug?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Package className="w-6 h-6 text-[#00875A]" />
            Products Catalog
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage store catalog, stock quantities, cross-border pricing, and wholesale MOQ parameters.
          </p>
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
                            {typeof p.category === "object" ? p.category?.name : (p.category || "General")}
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
                              onClick={() => setViewingProduct(p)}
                              className="p-1.5 text-text-muted hover:text-brand-600 rounded-lg hover:bg-surface-muted transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/admin/products/new?edit=${p.id || p.slug}`}
                              className="p-1.5 text-text-muted hover:text-blue-600 rounded-lg hover:bg-surface-muted transition-colors inline-flex items-center justify-center"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
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
                placeholder="e.g. Royal Kashmiri Saffron Grade-A"
                required
              />
              <Input
                label="SKU Code"
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                placeholder="e.g. VAN-SAF-01"
              />
              <Select
                label="Category"
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
                label="Stock Quantity"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                placeholder="100"
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
                  label="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Provide product details, specifications, or packaging info..."
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing & Regional Tiers */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
              2. Multi-Currency Pricing
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                <span className="text-xs font-bold text-emerald-900 block">🇺🇸 USA Price ($ USD) *</span>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.priceUS || productForm.pricing?.US?.retailPrice || ""}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      priceUS: e.target.value,
                      pricing: {
                        ...productForm.pricing,
                        US: { ...productForm.pricing?.US, retailPrice: parseFloat(e.target.value) || 0 },
                      },
                    })
                  }
                  placeholder="34.99"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-2">
                <span className="text-xs font-bold text-blue-900 block">🇨🇦 Canada Price (CA$ CAD)</span>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.priceCA || productForm.pricing?.CA?.retailPrice || ""}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      priceCA: e.target.value,
                      pricing: {
                        ...productForm.pricing,
                        CA: { ...productForm.pricing?.CA, retailPrice: parseFloat(e.target.value) || 0 },
                      },
                    })
                  }
                  placeholder="46.99"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                <span className="text-xs font-bold text-amber-900 block">Old Price / Strike ($)</span>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.oldPrice || productForm.pricing?.US?.oldPrice || ""}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      oldPrice: e.target.value,
                    })
                  }
                  placeholder="49.99"
                />
              </div>
            </div>
          </div>

          {/* Badges & Tags */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
              3. Badges & Tags
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(productForm.isBestSeller)}
                  onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                  className="accent-[#358B5B] w-4 h-4 rounded"
                />
                <span className="text-xs font-bold text-slate-800">Bestseller</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(productForm.isNewProduct)}
                  onChange={(e) => setProductForm({ ...productForm, isNewProduct: e.target.checked })}
                  className="accent-[#358B5B] w-4 h-4 rounded"
                />
                <span className="text-xs font-bold text-slate-800">New Product</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(productForm.isFeatured)}
                  onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  className="accent-[#358B5B] w-4 h-4 rounded"
                />
                <span className="text-xs font-bold text-slate-800">Featured</span>
              </label>
            </div>
          </div>

          {/* Dynamic Custom Product Attributes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700">
                4. Custom Product Attributes & Specs
              </h4>
              <button
                type="button"
                onClick={() =>
                  setProductForm({
                    ...productForm,
                    attributes: [...(productForm.attributes || []), { name: "", value: "" }],
                  })
                }
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Attribute</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {(productForm.attributes || []).map((attr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Attribute Name (e.g. Organic Grade, Purity, Material)"
                      value={attr.name}
                      onChange={(e) => {
                        const updated = [...productForm.attributes];
                        updated[index].name = e.target.value;
                        setProductForm({ ...productForm, attributes: updated });
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Attribute Value (e.g. 100% Certified, 99.8%)"
                      value={attr.value}
                      onChange={(e) => {
                        const updated = [...productForm.attributes];
                        updated[index].value = e.target.value;
                        setProductForm({ ...productForm, attributes: updated });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = productForm.attributes.filter((_, i) => i !== index);
                      setProductForm({ ...productForm, attributes: updated });
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Attribute"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!productForm.attributes || productForm.attributes.length === 0) && (
                <p className="text-xs text-text-muted italic py-1">
                  No custom attributes added yet. Click "+ Add Attribute" to define custom specs.
                </p>
              )}
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
          MODAL: VIEW PRODUCT DETAILS (API-DRIVEN)
      ============================================================ */}
      <ViewProductModal
        productId={viewingProduct?.id || viewingProduct?.slug}
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
      />

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
    </div>
  );
}


