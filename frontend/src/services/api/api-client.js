import { apiClient } from "./axios.js";
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
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
        // Realistic mock logins:
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
        if (credentials.email?.includes("agro") || credentials.email?.includes("b2b") || credentials.email?.includes("wholesale")) {
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
        let items = [...MOCK_PRODUCTS];
        if (params.search) {
          const q = params.search.toLowerCase();
          items = items.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q)
          );
        }
        if (params.category) {
          items = items.filter((p) => p.categoryId === params.category || p.slug.includes(params.category));
        }
        return { items, total: items.length, page: 1, limit: 20 };
      }
      return apiClient.get("/products", { params });
    },

    getProductBySlug: async (slug) => {
      if (USE_MOCK) {
        await delay(150);
        const product = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
        if (!product) throw new Error("Product not found");
        return product;
      }
      return apiClient.get(`/products/${slug}`);
    },

    getCategories: async () => {
      if (USE_MOCK) {
        await delay(100);
        return MOCK_CATEGORIES;
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

  // --- B2B Wholesale Portal ---
  b2b: {
    getCompanyProfile: async () => {
      if (USE_MOCK) {
        await delay(150);
        return MOCK_COMPANIES[0];
      }
      return apiClient.get("/b2b/company");
    },

    registerCompany: async (payload) => {
      if (USE_MOCK) {
        await delay(300);
        return {
          id: `comp-${Date.now()}`,
          ...payload,
          status: "PENDING",
        };
      }
      return apiClient.post("/companies", payload);
    },

    uploadDocument: async (companyId, payload) => {
      if (USE_MOCK) {
        await delay(300);
        return {
          id: `doc-${Date.now()}`,
          ...payload,
          status: "UPLOADED",
          uploadedAt: new Date().toISOString(),
        };
      }
      return apiClient.post(`/companies/${companyId}/documents`, payload);
    },

    submitVerification: async (companyId) => {
      if (USE_MOCK) {
        await delay(200);
        return { status: "UNDER_REVIEW" };
      }
      return apiClient.post(`/companies/${companyId}/submit-verification`);
    },

    getQuotes: async () => {
      if (USE_MOCK) {
        await delay(150);
        return MOCK_QUOTES;
      }
      return apiClient.get("/quotes");
    },

    getQuoteById: async (id) => {
      if (USE_MOCK) {
        await delay(150);
        const quote = MOCK_QUOTES.find((q) => q.id === id || q.quoteNumber === id);
        if (!quote) throw new Error("Quote not found");
        return quote;
      }
      return apiClient.get(`/quotes/${id}`);
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

  // --- Admin Dashboard ---
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

    getProducts: async () => {
      if (USE_MOCK) {
        await delay(150);
        return MOCK_PRODUCTS;
      }
      return apiClient.get("/admin/products");
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
