import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { toast } from "@/components/ui/Toast.jsx";

export const DEFAULT_PRODUCT_FORM = {
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
  attributes: [],
};

export function useProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [productForm, setProductForm] = useState(DEFAULT_PRODUCT_FORM);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => Api.admin.getProducts(),
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["admin-countries"],
    queryFn: () => Api.geography.getCountries(),
  });

  const createProductMutation = useMutation({
    mutationFn: (newProd) => Api.admin.createProduct(newProd),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
      toast.success("Product Created", `${created.name || "Product"} has been added to the master catalog.`);
      setIsProductModalOpen(false);
      setProductForm(DEFAULT_PRODUCT_FORM);
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

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      ...DEFAULT_PRODUCT_FORM,
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
      image: prod.image || prod.images?.[0]?.file?.url || DEFAULT_PRODUCT_FORM.image,
      oldPrice: prod.oldPrice || "",
      priceUS: prod.priceUS || prod.pricing?.US?.retailPrice || "",
      priceCA: prod.priceCA || prod.pricing?.CA?.retailPrice || "",
      isBestSeller: Boolean(prod.isBestSeller),
      isNewProduct: Boolean(prod.isNewProduct),
      isFeatured: Boolean(prod.isFeatured),
      stock: prod.stock || 100,
      sku: prod.sku || "",
      attributes: prod.attributes || [],
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const usCountry = countries.find((c) => c.code === "US" || c.name?.toLowerCase().includes("united states"));
    const caCountry = countries.find((c) => c.code === "CA" || c.name?.toLowerCase().includes("canada"));

    const baseUsdPrice = parseFloat(productForm.priceUS) || 0;
    const baseOldUsdPrice = productForm.oldPrice ? parseFloat(productForm.oldPrice) : null;
    const baseCadPrice = productForm.priceCA ? parseFloat(productForm.priceCA) : parseFloat((baseUsdPrice * 1.35).toFixed(2));
    const baseOldCadPrice = baseOldUsdPrice ? parseFloat((baseOldUsdPrice * 1.35).toFixed(2)) : null;
    const totalStock = parseInt(productForm.stock, 10) || 100;

    const productCountries = [];
    if (usCountry) {
      productCountries.push({
        countryId: usCountry.id,
        isAvailable: true,
        price: baseUsdPrice,
        oldPrice: baseOldUsdPrice,
        stock: Math.round(totalStock * 0.6),
      });
    }
    if (caCountry) {
      productCountries.push({
        countryId: caCountry.id,
        isAvailable: true,
        price: baseCadPrice,
        oldPrice: baseOldCadPrice,
        stock: Math.max(0, totalStock - Math.round(totalStock * 0.6)),
      });
    }

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description?.trim() || null,
      categoryId: productForm.categoryId || (categories[0]?.id || null),
      type: "SIMPLE",
      basePrice: baseUsdPrice,
      stock: totalStock,
      sku: productForm.sku?.trim() || `VAN-${Date.now().toString().slice(-6)}`,
      isFeatured: Boolean(productForm.isFeatured),
      isNew: Boolean(productForm.isNewProduct),
      isBestSeller: Boolean(productForm.isBestSeller),
      isActive: true,
      images: productForm.image?.trim() ? [{ url: productForm.image.trim(), sortOrder: 0 }] : [],
      ...(productCountries.length > 0 ? { countries: productCountries } : {}),
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createProductMutation.mutate(payload);
    }
  };

  const productList = Array.isArray(products) ? products : (products?.items || []);
  const categoryList = Array.isArray(categories) ? categories : (categories?.items || []);

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

  return {
    products: productList,
    filteredProducts,
    categories: categoryList,
    countries,
    loadingProducts,
    loadingCategories,
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
    isSubmitting: createProductMutation.isPending || updateProductMutation.isPending,
  };
}
