import { create } from "zustand";






















export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      const price = product.resolvedPrice?.unitPrice ?? product.price ?? 0;
      const originalPrice = product.resolvedPrice?.originalPrice;
      const imageUrl =
      product.images?.[0]?.file?.url || product.images?.[0]?.url || "";

      if (existing) {
        return {
          items: state.items.map((i) =>
          i.productId === product.id ?
          { ...i, quantity: i.quantity + quantity } :
          i
          )
        };
      }

      return {
        items: [
        ...state.items,
        {
          productId: product.id,
          name: product.name,
          price,
          originalPrice,
          imageUrl,
          quantity
        }]

      };
    });
  },

  removeItem: (productId) =>
  set((state) => ({
    items: state.items.filter((i) => i.productId !== productId)
  })),

  updateQuantity: (productId, quantity) =>
  set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter((i) => i.productId !== productId) };
    }
    return {
      items: state.items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
      )
    };
  }),

  clearCart: () => set({ items: [] }),

  getTotalCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
}));