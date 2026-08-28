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

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const Api = {
  // --- Auth ---
  auth: {
    login: async (credentials) => {
      if (USE_MOCK) {
        await delay(200);
        if (credentials.email?.includes("admin")) {
          return {
            user: {
              id: "usr-admin",
              email: credentials.email,
              firstName: "Admin",
              lastName: "User",
              customerType: "B2C",
              roles: ["ADMIN", "SUPER_ADMIN"],
              permissions: ["catalog.create", "catalog.update", "orders.read", "companies.verify"],
            },
            tokens: { accessToken: "mock-admin-token", refreshToken: "mock-refresh-token" },
          };
        }
        if (credentials.email?.includes("apex") || credentials.email?.includes("agro") || credentials.email?.includes("b2b") || credentials.email?.includes("wholesale")) {
          return {
            user: {
              id: "usr-b2b-buyer",
              email: credentials.email,
              firstName: "Rajesh",
              lastName: "Kulkarni",
              customerType: "B2B",
              roles: ["CUSTOMER"],
              companyMembers: [{ company: MOCK_COMPANIES[0], role: "COMPANY_ADMIN" }],
            },
            tokens: { accessToken: "mock-b2b-token", refreshToken: "mock-refresh-token" },
          };
        }
        return {
          user: {
            id: "usr-b2c-1",
            email: credentials.email,
            firstName: "Ramesh",
            lastName: "Sharma",
            customerType: "B2C",
            roles: ["CUSTOMER"],
          },
          tokens: { accessToken: "mock-b2c-token", refreshToken: "mock-refresh-token" },
        };
      }
      return apiClient.post("/auth/login", credentials);
    },

    register: async (payload) => {
      if (USE_MOCK) {
        await delay(200);
        return {
          user: {
            id: `usr-${Date.now()}`,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            customerType: payload.customerType || "B2C",
            roles: ["CUSTOMER"],
          },
          tokens: { accessToken: "mock-reg-token", refreshToken: "mock-reg-refresh" },
        };
      }
      return apiClient.post("/auth/register", payload);
    },

    getMe: async () => {
      if (USE_MOCK) {
        await delay(100);
        return null;
      }
      return apiClient.get("/auth/me");
    },
  },

  // --- Catalog ---
  catalog: {
    getProducts: async (params = {}) => {
      if (USE_MOCK) {
        await delay(150);
        let items = getLiveProducts();
        if (params.search) {
          const q = params.search.toLowerCase();
          items = items.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.sku?.toLowerCase().includes(q) ||
              p.category?.toLowerCase().includes(q)
          );
        }
        if (params.category) {
          items = items.filter((p) => p.categoryId === params.category || p.slug?.includes(params.category));
        }
        return { items, total: items.length, page: 1, limit: 50 };
      }
      return apiClient.get("/products", { params });
    },

    getProductBySlug: async (slug) => {
      if (USE_MOCK) {
        await delay(150);
        const products = getLiveProducts();
        const product = products.find((p) => p.slug === slug || p.id === slug);
        if (!product) throw new Error("Product not found");
        return product;
      }
      return apiClient.get(`/products/${slug}`);
    },

    getCategories: async () => {
      if (USE_MOCK) {
        await delay(100);
        return getLiveCategories();
      }
      return apiClient.get("/categories");
    },
  },

  // --- Cart & Checkout ---
  cart: {
    getCart: async () => {
      if (USE_MOCK) {
        await delay(100);
        return { items: [], itemCount: 0, subtotal: 0 };
      }
      return apiClient.get("/cart");
    },

    addItem: async (item) => {
      if (USE_MOCK) {
        await delay(150);
        return { success: true };
      }
      return apiClient.post("/cart/items", item);
    },

    validateCheckout: async (payload) => {
      if (USE_MOCK) {
        await delay(200);
        const subtotal = payload.items?.reduce((sum, item) => sum + (item.price || 499) * item.quantity, 0) || 499;
        const taxAmount = Number((subtotal * 0.18).toFixed(2));
        const shippingCost = 50;
        return {
          subtotal,
          taxAmount,
          shippingCost,
          totalAmount: subtotal + taxAmount + shippingCost,
        };
      }
      return apiClient.post("/checkout/validate", payload);
    },

    placeOrder: async (payload) => {
      if (USE_MOCK) {
        await delay(300);
        const newOrder = {
          id: `ord-${Date.now()}`,
          orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
          status: "CONFIRMED",
          createdAt: new Date().toISOString(),
          ...payload,
        };
        return newOrder;
      }
      return apiClient.post("/checkout/place-order", payload, {
        headers: { "Idempotency-Key": `idem_${Date.now()}` },
      });
    },
  },

  // --- Orders ---
  orders: {
    list: async (params = {}) => {
      if (USE_MOCK) {
        await delay(150);
        return { items: MOCK_ORDERS, total: MOCK_ORDERS.length };
      }
      return apiClient.get("/orders", { params });
    },

    getById: async (id) => {
      if (USE_MOCK) {
        await delay(150);
        const order = MOCK_ORDERS.find((o) => o.id === id || o.orderNumber === id);
        if (!order) throw new Error("Order not found");
        return order;
      }
      return apiClient.get(`/orders/${id}`);
    },
  },

  // --- B2B Portal ---
  b2b: {
    getCompany: async () => {
      if (USE_MOCK) {
        await delay(150);
        return MOCK_COMPANIES[0];
      }
      return apiClient.get("/companies/my");
    },

    getQuotes: async () => {
      if (USE_MOCK) {
        await delay(150);
        return MOCK_QUOTES;
      }
      return apiClient.get("/quotes");
    },

    requestQuote: async (payload) => {
      if (USE_MOCK) {
        await delay(250);
        return {
          id: `qte-${Date.now()}`,
          quoteNumber: `QTE-${Date.now().toString().slice(-8)}`,
          status: "REQUESTED",
          createdAt: new Date().toISOString(),
          ...payload,
        };
      }
      return apiClient.post("/quotes", payload);
    },

    acceptQuote: async (id) => {
      if (USE_MOCK) {
        await delay(200);
        return { status: "ACCEPTED" };
      }
      return apiClient.post(`/quotes/${id}/accept`);
    },
  },

  // --- Admin Dashboard & Master Catalog Management ---
  admin: {
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
      return apiClient.get("/admin/products");
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
      return apiClient.get("/categories");
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
  },
};
