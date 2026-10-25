import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { toast } from "@/components/ui/Toast.jsx";
import { useTablePagination } from "@/hooks/useTablePagination.js";

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
  warehouseId: "",
  weight: "",
  weightUnit: "lb",
  length: "",
  width: "",
  height: "",
  dimensionUnit: "in",
  attributes: [],
};

export function useProducts() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [productForm, setProductForm] = useState(DEFAULT_PRODUCT_FORM);

  // Debounce search query so user typing doesn't fire requests on each keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Server-side paginated product query with real total count
  const { data: productsData = [], isLoading: loadingProducts } = useQuery({
    queryKey: [
      "admin-products",
      {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        categoryId: selectedCategory !== "ALL" ? selectedCategory : undefined,
      },
    ],
    queryFn: () =>
      Api.admin.getProducts({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        categoryId: selectedCategory !== "ALL" ? selectedCategory : undefined,
      }),
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["admin-countries"],
    queryFn: () => Api.geography.getCountries(),
  });

  const { data: warehousesRes = [] } = useQuery({
    queryKey: ["admin-warehouses"],
    queryFn: () => Api.admin.getWarehouses(),
  });
  const warehouses = Array.isArray(warehousesRes) ? warehousesRes : warehousesRes?.data || [];

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
    const defaultWh = warehouses.find((w) => w.isDefault) || warehouses[0];
    setProductForm({
      ...DEFAULT_PRODUCT_FORM,
      categoryId: categories[0]?.id || "",
      warehouseId: defaultWh?.id || "",
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
      warehouseId: prod.warehouseId || "",
      weight: prod.weight !== null && prod.weight !== undefined ? String(prod.weight) : "",
      weightUnit: prod.weightUnit || "lb",
      length: prod.length !== null && prod.length !== undefined ? String(prod.length) : "",
      width: prod.width !== null && prod.width !== undefined ? String(prod.width) : "",
      height: prod.height !== null && prod.height !== undefined ? String(prod.height) : "",
      dimensionUnit: prod.dimensionUnit || "in",
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
      warehouseId: productForm.warehouseId || null,
      weight: productForm.weight !== "" && productForm.weight !== null && productForm.weight !== undefined ? parseFloat(productForm.weight) : null,
      weightUnit: productForm.weightUnit || "lb",
      length: productForm.length !== "" && productForm.length !== null && productForm.length !== undefined ? parseFloat(productForm.length) : null,
      width: productForm.width !== "" && productForm.width !== null && productForm.width !== undefined ? parseFloat(productForm.width) : null,
      height: productForm.height !== "" && productForm.height !== null && productForm.height !== undefined ? parseFloat(productForm.height) : null,
      dimensionUnit: productForm.dimensionUnit || "in",
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

  const productList = Array.isArray(productsData)
    ? productsData
    : Array.isArray(productsData?.items)
    ? productsData.items
    : Array.isArray(productsData?.data)
    ? productsData.data
    : [];

  const categoryList = Array.isArray(categories) ? categories : (categories?.items || []);

  const totalCatalogCount =
    productsData?.total ??
    productsData?.meta?.total ??
    productsData?.pagination?.total ??
    productList.length;

  const {
    totalPages,
    totalItems: totalFilteredCount,
    pageSizeOptions,
    paginatedData: paginatedProducts,
    setCurrentPage: setTablePage,
    setPageSize: setTablePageSize,
    resetPage,
    paginationProps,
  } = useTablePagination({
    data: productList,
    initialPage: currentPage,
    initialPageSize: pageSize,
    pageSizeOptions: [10, 20, 50, 100],
    totalItems: totalCatalogCount,
    onPageChange: (newPage) => setCurrentPage(newPage),
    onPageSizeChange: (newSize) => {
      setPageSize(newSize);
      setCurrentPage(1);
    },
  });

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  return {
    products: productList,
    filteredProducts: productList,
    paginatedProducts: productList,
    totalFilteredCount,
    currentPage,
    setCurrentPage: (p) => {
      setCurrentPage(p);
      setTablePage(p);
    },
    pageSize,
    setPageSize: (s) => {
      setPageSize(s);
      setTablePageSize(s);
    },
    pageSizeOptions,
    totalPages,
    paginationProps,
    categories: categoryList,
    countries,
    loadingProducts,
    loadingCategories,
    search,
    setSearch: handleSearchChange,
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
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
    warehouses,
    isSubmitting: createProductMutation.isPending || updateProductMutation.isPending,
  };
}
