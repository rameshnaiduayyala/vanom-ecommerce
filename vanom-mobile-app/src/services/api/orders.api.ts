import { api } from "../../lib/api";

export interface Address {
  fullName?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  countryCode: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    name: string;
    slug: string;
    images?: Array<{ file?: { url: string }; url?: string }>;
  };
}

export interface Order {
  id: string;
  orderNumber?: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  paymentStatus?: "PENDING" | "PAID" | "FAILED";
  totalAmount: number;
  currency: string;
  shippingAddress: Address;
  items: OrderItem[];
  createdAt: string;
}

export const ordersApi = {
  getOrders: (params: { page?: number; limit?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.status) query.append("status", params.status);
    const qs = query.toString();
    return api.get<{ success: boolean; data: { items: Order[]; meta: any } }>(`/orders${qs ? `?${qs}` : ""}`);
  },

  getOrderById: (id: string) =>
    api.get<{ success: boolean; data: Order }>(`/orders/${id}`),

  createOrder: (payload: {
    shippingAddress: Address;
    billingAddress?: Address;
    items?: Array<{ productId: string; variantId?: string | null; quantity: number }>;
    shippingCharges?: number;
    discount?: number;
  }) => api.post<{ success: boolean; data: Order }>("/orders", payload),

  checkout: (payload: {
    shippingAddress: Address;
    billingAddress?: Address;
    items?: Array<{ productId: string; variantId?: string | null; quantity: number }>;
  }) => api.post<{ success: boolean; data: { order: Order; clientSecret?: string } }>("/checkout", payload),
};
