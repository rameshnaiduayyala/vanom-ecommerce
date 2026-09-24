import { apiClient } from "./axios.js";

export const contactService = {
  /**
   * Submit storefront contact inquiry
   */
  submitContactForm: async (payload) => {
    const res = await apiClient.post("/contact", payload);
    return res?.data ?? res;
  },

  /**
   * Get contact messages (Admin)
   */
  getContactMessages: async (params = {}) => {
    const res = await apiClient.get("/admin/contact-messages", { params });
    return res?.data ?? res;
  },

  /**
   * Update message status (Admin)
   */
  updateContactMessage: async (id, payload) => {
    const res = await apiClient.patch(`/admin/contact-messages/${id}`, payload);
    return res?.data ?? res;
  },

  /**
   * Delete message (Admin)
   */
  deleteContactMessage: async (id) => {
    const res = await apiClient.delete(`/admin/contact-messages/${id}`);
    return res?.data ?? res;
  }
};
