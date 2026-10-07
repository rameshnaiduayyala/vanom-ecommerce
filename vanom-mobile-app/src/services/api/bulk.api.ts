import { api } from "../../lib/api";

export interface BusinessRegistrationPayload {
  companyName: string;
  businessType: string;
  gstin?: string;
  pan?: string;
  registrationNumber?: string;
  industry?: string;
  contactPerson: string;
  businessEmail: string;
  phone: string;
  registeredAddress: string;
}

export interface BusinessProfile {
  id: string;
  companyName: string;
  businessEmail: string;
  phone: string;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  gstin?: string;
}

export interface BulkProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  minOrderQuantity: number;
  bulkUnitPrice: number;
  availableStock: number;
  packagingUnit?: string;
  images?: Array<{ url: string }>;
}

export const bulkApi = {
  registerBusiness: (payload: BusinessRegistrationPayload) =>
    api.post<{ success: boolean; data: BusinessProfile }>("/bulk/business/register", payload),

  getBusinessProfile: () =>
    api.get<{ success: boolean; data: BusinessProfile }>("/bulk/business/me"),

  getBusinessDashboard: () =>
    api.get<{ success: boolean; data: any }>("/bulk/business/dashboard"),

  getBulkProducts: (params: { page?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.append("page", String(params.page));
    if (params.limit) qs.append("limit", String(params.limit));
    const s = qs.toString();
    return api.get<{ success: boolean; data: { items: BulkProduct[]; meta: any } }>(`/bulk/products${s ? `?${s}` : ""}`);
  },

  getBulkCart: () => api.get<{ success: boolean; data: any }>("/bulk/cart"),

  addBulkCartItem: (payload: { bulkProductId: string; quantity: number }) =>
    api.post<{ success: boolean; data: any }>("/bulk/cart/items", payload),
};
