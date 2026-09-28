import { apiClient } from "./axios.js";

export const shippingService = {
  validateAddress: async (payload) => {
    return apiClient.post("/shipping/address/validate", payload, { silent: true });
  },

  getShippingRates: async (payload) => {
    return apiClient.post("/shipping/rates", payload, { silent: true });
  },

  getTracking: async (trackingNumber, carrier = null, orderId = null) => {
    return apiClient.get(`/shipping/tracking/${trackingNumber}`, {
      params: { carrier, orderId },
      silent: true
    });
  },

  getOrderShipments: async (orderId) => {
    return apiClient.get(`/shipping/orders/${orderId}/shipments`, { silent: true });
  },

  createShipment: async (payload) => {
    return apiClient.post("/shipping/shipments", payload);
  },

  createLabel: async (shipmentId, payload = {}) => {
    return apiClient.post(`/shipping/shipments/${shipmentId}/label`, payload);
  },

  listShipments: async (params = {}) => {
    return apiClient.get("/shipping/admin/shipments", { params });
  },

  updateShipmentStatus: async (shipmentId, status) => {
    return apiClient.put(`/shipping/shipments/${shipmentId}/status`, { status });
  }
};
