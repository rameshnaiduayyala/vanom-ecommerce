import { apiClient } from "./axios.js";
import {
  getLiveProducts,
  saveLiveProducts,
  getLiveCategories,
  saveLiveCategories,
  MOCK_COMPANIES,
  MOCK_ORDERS,
  MOCK_QUOTES,
  MOCK_ADMIN_METRICS,
} from "./mock-data.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const adminService = {
  getDashboardMetrics: async () => {
    if (USE_MOCK) {
      await delay(150);
      return MOCK_ADMIN_METRICS;
    }
    return apiClient.get("/admin/metrics");
  },

  getBusinessApplications: async (params = {}) => {
    if (USE_MOCK) {
      await delay(150);
      return {
        items: MOCK_COMPANIES,
        total: MOCK_COMPANIES.length,
      };
    }
    return apiClient.get("/admin/business-applications", { params });
  },

  approveApplication: async (id, notes) => {
    if (USE_MOCK) {
      await delay(250);
      return { success: true, status: "APPROVED", notes };
    }
    return apiClient.post(`/admin/business-applications/${id}/approve`, { notes });
  },

  rejectApplication: async (id, reason) => {
    if (USE_MOCK) {
      await delay(250);
      return { success: true, status: "REJECTED", reason };
    }
    return apiClient.post(`/admin/business-applications/${id}/reject`, { reason });
  },

  // --- Product CRUD ---
  getProducts: async () => {
    if (USE_MOCK) {
      await delay(150);
      return getLiveProducts();
    }
    const products = await apiClient.get("/admin/products");
    return Array.isArray(products)
      ? products.map((p) => {
          // Normalize category field: stringify if object or relational array
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

          return {
            ...p,
            category: catName,
            categoryId: catId || p.categoryId,
            brand: p.brand?.name || (typeof p.brand === "string" ? p.brand : "Vanom Brand"),
            image:
              p.images?.[0]?.file?.url ||
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
              IN: { currency: "USD", symbol: "$", retailPrice: 1999, moq: 20 },
              US: { currency: "USD", symbol: "$", retailPrice: 35.0, moq: 20 },
              GB: { currency: "GBP", symbol: "£", retailPrice: 28.0, moq: 20 },
            },
          };
        })
      : [];
  },

  createProduct: async (productData) => {
    if (USE_MOCK) {
      await delay(250);
      const products = getLiveProducts();
      const newProduct = {
        id: `prod-${Date.now()}`,
        slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        rating: 5.0,
        reviewsCount: 0,
        ...productData,
      };
      const updated = [newProduct, ...products];
      saveLiveProducts(updated);
      return newProduct;
    }
    return apiClient.post("/admin/products", productData);
  },

  updateProduct: async (id, productData) => {
    if (USE_MOCK) {
      await delay(250);
      const products = getLiveProducts();
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Product not found");
      const updatedProduct = { ...products[index], ...productData };
      products[index] = updatedProduct;
      saveLiveProducts(products);
      return updatedProduct;
    }
    return apiClient.put(`/admin/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    if (USE_MOCK) {
      await delay(200);
      const products = getLiveProducts().filter((p) => p.id !== id);
      saveLiveProducts(products);
      return { success: true, id };
    }
    return apiClient.delete(`/admin/products/${id}`);
  },

  // --- Category CRUD ---
  getCategories: async () => {
    if (USE_MOCK) {
      await delay(100);
      return getLiveCategories();
    }
    const categories = await apiClient.get("/admin/categories");
    return Array.isArray(categories)
      ? categories.map((c) => ({
          ...c,
          name: typeof c.name === "string" ? c.name : c.name?.name || "Category",
          count: c._count?.products || c.count || c.products?.length || 0,
          description: typeof c.description === "string" ? c.description : "Official category taxonomy.",
        }))
      : [];
  },

  createCategory: async (categoryData) => {
    if (USE_MOCK) {
      await delay(200);
      const categories = getLiveCategories();
      const newCategory = {
        id: `cat-${Date.now()}`,
        slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        count: 0,
        ...categoryData,
      };
      const updated = [...categories, newCategory];
      saveLiveCategories(updated);
      return newCategory;
    }
    return apiClient.post("/admin/categories", categoryData);
  },

  updateCategory: async (id, categoryData) => {
    if (USE_MOCK) {
      await delay(200);
      const categories = getLiveCategories();
      const index = categories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Category not found");
      const updatedCategory = { ...categories[index], ...categoryData };
      categories[index] = updatedCategory;
      saveLiveCategories(categories);
      return updatedCategory;
    }
    return apiClient.put(`/admin/categories/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    if (USE_MOCK) {
      await delay(200);
      const categories = getLiveCategories().filter((c) => c.id !== id);
      saveLiveCategories(categories);
      return { success: true, id };
    }
    return apiClient.delete(`/admin/categories/${id}`);
  },

  getOrders: async () => {
    if (USE_MOCK) {
      await delay(150);
      return MOCK_ORDERS;
    }
    return apiClient.get("/admin/orders");
  },

  getCompanies: async () => {
    if (USE_MOCK) {
      await delay(150);
      return MOCK_COMPANIES;
    }
    return apiClient.get("/admin/companies");
  },

  getUsers: async () => {
    if (USE_MOCK) {
      await delay(150);
      return [
        { id: "usr-admin", email: "admin@vanom.com", firstName: "Super", lastName: "Admin", roles: ["SUPER_ADMIN"], status: "ACTIVE" },
        { id: "usr-b2b", email: "buyer@agrowholesale.in", firstName: "Ramesh", lastName: "Patel", roles: ["COMPANY_ADMIN"], status: "ACTIVE" },
        { id: "usr-b2c", email: "customer@vanom.com", firstName: "Ramesh", lastName: "Ayyala", roles: ["CUSTOMER"], status: "ACTIVE" },
      ];
    }
    return apiClient.get("/admin/users");
  },

  getInventory: async () => {
    if (USE_MOCK) {
      await delay(150);
      return [
        { name: "Mumbai Central Warehouse", country: { code: "IN", name: "India" }, items: [{ onHand: 2450, reserved: 200 }] },
        { name: "Dallas Fulfillment Center", country: { code: "US", name: "United States" }, items: [{ onHand: 890, reserved: 50 }] },
        { name: "London Logistics Depot", country: { code: "GB", name: "United Kingdom" }, items: [{ onHand: 350, reserved: 20 }] },
      ];
    }
    return apiClient.get("/admin/inventory");
  },

  getAdminQuotes: async () => {
    if (USE_MOCK) {
      await delay(150);
      return MOCK_QUOTES;
    }
    return apiClient.get("/admin/quotes");
  },

  getPayments: async () => {
    if (USE_MOCK) {
      await delay(150);
      return [
        { id: "pay-1", transactionId: "pay_rzp_98471928", provider: "Razorpay (India)", amount: 1227.64, idempotencyKey: "idem_1772288000_abc", status: "CAPTURED" },
        { id: "pay-2", transactionId: "ch_3N8F92849182", provider: "Stripe (US / UK)", amount: 129.50, idempotencyKey: "idem_1772288120_def", status: "CAPTURED" },
      ];
    }
    return apiClient.get("/admin/payments");
  },

  getReports: async () => {
    if (USE_MOCK) {
      await delay(150);
      return {
        orderCount: 148,
        totalRevenue: 124800,
        customerCount: 12,
        indiaGst: 482450.00,
        usSalesTax: 18420.00,
        ukVat: 12900.00,
      };
    }
    return apiClient.get("/admin/reports");
  },

  getAuditLogs: async () => {
    if (USE_MOCK) {
      await delay(150);
      return [
        { id: "log-1", action: "PRODUCT_CREATED", entityType: "Product", entityId: "prod-1", ipAddress: "127.0.0.1", createdAt: new Date().toISOString() },
        { id: "log-2", action: "COMPANY_APPROVED", entityType: "Company", entityId: "00000000-0000-0000-0000-000000000001", ipAddress: "127.0.0.1", createdAt: new Date().toISOString() },
      ];
    }
    return apiClient.get("/admin/audit-logs");
  },
};
