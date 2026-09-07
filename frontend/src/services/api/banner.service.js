import { apiClient } from "./axios.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_BANNERS = [
  {
    id: "banner-1",
    title: "Commercial Agricultural Supplies & Nutrients",
    subtitle: "Enterprise Procurement 2026",
    description: "Direct manufacturer pricing for certified fertilizers, seeds, and industrial soil conditioners with guaranteed delivery.",
    type: "HERO_CAROUSEL",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Explore Wholesale",
    buttonLink: "/products?category=gardening-supplies",
    badgeText: "Verified Global Exporters",
    bgGradient: "from-emerald-900 via-emerald-800 to-green-950",
    sortOrder: 1,
    active: true,
  },
  {
    id: "banner-2",
    title: "Glazed Architectural Planters & Horticultural Ceramics",
    subtitle: "Premium Design Series",
    description: "Handcrafted frost-resistant planters engineered for commercial resorts, corporate offices, and botanical landscapers.",
    type: "HERO_CAROUSEL",
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Browse Collection",
    buttonLink: "/products?category=pots-and-planters",
    badgeText: "High Durability",
    bgGradient: "from-stone-900 via-stone-800 to-amber-950",
    sortOrder: 2,
    active: true,
  },
  {
    id: "banner-3",
    title: "Flash Deal: Extra 15% Off Bulk Pallet Freight",
    subtitle: "Limited Time Offer",
    description: "Take advantage of zero container demurrage and volume pricing on all domestic interstate bulk shipments.",
    type: "PROMOTIONAL",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Claim Discount",
    buttonLink: "/b2b/bulk-order",
    badgeText: "Flash Deal",
    bgGradient: "from-blue-900 via-indigo-900 to-slate-900",
    sortOrder: 1,
    active: true,
  },
];

export const bannerService = {
  list: async (params = {}) => {
    if (USE_MOCK) {
      await delay(100);
      let items = [...MOCK_BANNERS];
      if (params.type) {
        items = items.filter((b) => b.type === params.type);
      }
      return items;
    }
    return apiClient.get("/banners", { params });
  },

  getById: async (id) => {
    if (USE_MOCK) {
      await delay(100);
      const b = MOCK_BANNERS.find((x) => x.id === id);
      if (!b) throw new Error("Banner not found");
      return b;
    }
    return apiClient.get(`/banners/${id}`);
  },

  create: async (payload) => {
    return apiClient.post("/banners", payload);
  },

  update: async (id, payload) => {
    return apiClient.put(`/banners/${id}`, payload);
  },

  delete: async (id) => {
    return apiClient.delete(`/banners/${id}`);
  },
};
