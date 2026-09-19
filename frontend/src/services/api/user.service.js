import { apiClient } from "./axios.js";

export const userService = {
  getProfile: async () => {
    return apiClient.get("/users/profile");
  },

  updateProfile: async (userData) => {
    return apiClient.put("/users/profile", userData);
  },

  getAddresses: async () => {
    return apiClient.get("/users/addresses");
  },

  addAddress: async (addressData) => {
    return apiClient.post("/users/addresses", addressData);
  },

  updateAddress: async (addressId, addressData) => {
    return apiClient.put(`/users/addresses/${addressId}`, addressData);
  },

  deleteAddress: async (addressId) => {
    return apiClient.delete(`/users/addresses/${addressId}`);
  },

  // Admin / User Management endpoints
  getUsers: async (params = {}) => {
    return apiClient.get("/users", { params });
  },

  getUserById: async (id) => {
    return apiClient.get(`/users/${id}`);
  },

  createUser: async (userData) => {
    return apiClient.post("/users", userData);
  },

  updateUser: async (id, userData) => {
    return apiClient.put(`/users/${id}`, userData);
  },

  deleteUser: async (id) => {
    return apiClient.delete(`/users/${id}`);
  },
};
