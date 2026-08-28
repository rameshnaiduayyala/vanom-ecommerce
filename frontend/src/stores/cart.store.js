import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cart: {
    items: [],
    itemCount: 0,
    subtotal: 0,
  },
  isOpen: false,

  setCart: (cartData) => {
    set({
      cart: {
        items: cartData?.items || [],
        itemCount: cartData?.itemCount ?? (cartData?.items?.length || 0),
        subtotal: cartData?.subtotal || 0,
        ...cartData,
      },
    });
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  clearLocalCart: () => {
    set({
      cart: {
        items: [],
        itemCount: 0,
        subtotal: 0,
      },
    });
  },
}));
