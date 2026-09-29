import { create } from "zustand";
import { storeService } from "../services/api/store.service.js";

export const useStoreSettingsStore = create((set, get) => ({
  store: null,
  loading: false,
  error: null,

  fetchPublicStore: async (force = false) => {
    if (get().store && !force) return get().store;

    try {
      set({ loading: true, error: null });
      const data = await storeService.getPublicStore();
      set({ store: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err?.message || "Failed to fetch store settings", loading: false });
      return null;
    }
  },

  setStore: (store) => set({ store }),
}));
