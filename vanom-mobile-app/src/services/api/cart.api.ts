import { api } from "../../lib/api";
import { Product } from "./products.api";

export interface CartItem {
  id: string;
  cartId?: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal?: number;
  currency?: string;
}

export const cartApi = {
  getCart: () => api.get<{ success: boolean; data: Cart }>("/cart"),

  addItem: (payload: { productId: string; variantId?: string | null; quantity: number }) =>
    api.post<{ success: boolean; data: CartItem }>("/cart/items", payload),

  updateItem: (itemId: string, quantity: number) =>
    api.put<{ success: boolean; data: CartItem }>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    api.delete<{ success: boolean; data: { message: string } }>(`/cart/items/${itemId}`),

  clearCart: () =>
    api.delete<{ success: boolean; data: { message: string } }>("/cart"),
};
