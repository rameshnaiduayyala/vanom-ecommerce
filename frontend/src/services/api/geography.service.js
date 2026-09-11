import { apiClient } from "./axios.js";

export const geographyService = {
  getCountries: async () => {
    try {
      const res = await apiClient.get("/countries");
      const list = Array.isArray(res) ? res : res?.data || res?.items || [];
      return list;
    } catch (err) {
      console.error("Failed to load countries from backend API:", err);
      return [];
    }
  },

  getCountry: async (idOrCode) => {
    try {
      const res = await apiClient.get(`/countries/${idOrCode}`);
      return res?.data || res;
    } catch (err) {
      console.error(`Failed to load country ${idOrCode} from backend API:`, err);
      return null;
    }
  },
};

