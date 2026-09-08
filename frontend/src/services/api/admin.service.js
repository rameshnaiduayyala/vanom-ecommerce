import { apiClient } from "./axios.js";

export const adminService = {
  getDashboardMetrics: async () => {
    return apiClient.get("/admin/metrics");
  },

  getBusinessApplications: async (params = {}) => {
    return apiClient.get("/admin/business-applications", { params });
  },

  approveApplication: async (id, notes) => {
    return apiClient.post(`/admin/business-applications/${id}/approve`, { notes });
  },

  rejectApplication: async (id, reason) => {
    return apiClient.post(`/admin/business-applications/${id}/reject`, { reason });
  },

  // --- Product CRUD ---
  getProducts: async () => {
    const res = await apiClient.get("/admin/products");
    const rawProducts = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : [];
    
    return rawProducts.map((p) => {
      let catName = "General";
      let catId = "";
      if (p.categories && Array.isArray(p.categories) && p.categories.length > 0) {
        catName = p.categories[0]?.category?.name || p.categories[0]?.name || "General";
        catId = p.categories[0]?.categoryId || p.categories[0]?.category?.id || "";
      } else if (p.category && typeof p.category === "object") {
        catName = p.category.name || "General";
        catId = p.category.id || "";
      } else if (typeof p.category === "string") {
        catName = p.category;
      }

      const inrPrice = p.prices?.find((pr) => pr.currency?.code === "INR")?.amount;
      const usdPrice = p.prices?.find((pr) => pr.currency?.code === "USD")?.amount;
      const gbpPrice = p.prices?.find((pr) => pr.currency?.code === "GBP")?.amount;

      return {
        ...p,
        category: catName,
        categoryId: catId || p.categoryId,
        brand: p.brand?.name || (typeof p.brand === "string" ? p.brand : "Vanom Brand"),
        image:
          p.images?.[0]?.file?.url ||
          p.images?.[0]?.url ||
          p.image ||
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
        stock: p.variants?.[0]?.inventoryItems?.reduce((sum, item) => sum + (item.onHand || 0), 0) || p.stock || 500,
        packaging: p.variants?.[0]?.packaging?.[0]
          ? {
              unitName: p.variants[0].packaging[0].unit?.name || "Unit",
              weightKg: Number(p.variants[0].weight || 1),
              dimensionsCm: "Standard",
              palletQuantity: p.variants[0].packaging[0].pallet?.packagesPerPallet || 40,
              palletWeightKg: Number(p.variants[0].packaging[0].pallet?.maxWeight || 1000),
            }
          : p.packaging || {
              unitName: "Standard Pack",
              weightKg: 1,
              dimensionsCm: "Standard",
              palletQuantity: 40,
              palletWeightKg: 1000,
            },
        pricing: p.pricing || {
          IN: { currency: "INR", symbol: "₹", retailPrice: Number(inrPrice || 1499), moq: 1 },
          US: { currency: "USD", symbol: "$", retailPrice: Number(usdPrice || 35.0), moq: 1 },
          GB: { currency: "GBP", symbol: "£", retailPrice: Number(gbpPrice || 28.0), moq: 1 },
        },
      };
    });
  },

  createProduct: async (productData) => {
    return apiClient.post("/products", productData);
  },

  updateProduct: async (id, productData) => {
    return apiClient.put(`/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    return apiClient.delete(`/products/${id}`);
  },

  // --- Category CRUD ---
  getCategories: async () => {
    const res = await apiClient.get("/admin/categories");
    const rawCategories = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : [];
    
    return rawCategories.map((c) => ({
      ...c,
      name: typeof c.name === "string" ? c.name : c.name?.name || "Category",
      slug: c.slug || "",
      description: typeof c.description === "string" ? c.description : "",
      imageUrl: c.imageUrl || (c.imageAsset ? `/api/v1/files/${c.imageAsset.storageKey}` : ""),
      active: c.active !== undefined ? Boolean(c.active) : true,
      sortOrder: c.sortOrder || 0,
      parentId: c.parentId || null,
      parentName: c.parent?.name || null,
      count: c._count?.products !== undefined ? c._count.products : (c.count || c.products?.length || 0),
    }));
  },

  createCategory: async (categoryData) => {
    return apiClient.post("/categories", categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    return apiClient.delete(`/categories/${id}`);
  },

  getOrders: async () => {
    return apiClient.get("/admin/orders");
  },

  updateOrderStatus: async (id, status) => {
    return apiClient.patch(`/admin/orders/${id}/status`, { status });
  },

  getCompanies: async () => {
    return apiClient.get("/admin/companies");
  },

  getUsers: async () => {
    return apiClient.get("/admin/users");
  },

  getInventory: async () => {
    return apiClient.get("/admin/inventory");
  },

  getAdminQuotes: async () => {
    return apiClient.get("/admin/quotes");
  },

  getPayments: async () => {
    return apiClient.get("/admin/payments");
  },

  getReports: async () => {
    return apiClient.get("/admin/reports");
  },

  getAuditLogs: async () => {
    return apiClient.get("/admin/audit-logs");
  },
};
