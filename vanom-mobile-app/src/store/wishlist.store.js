import { create } from "zustand";







export const useWishlistStore = create((set, get) => ({
  wishlistIds: [],
  toggleWishlist: (productId) =>
  set((state) => ({
    wishlistIds: state.wishlistIds.includes(productId) ?
    state.wishlistIds.filter((id) => id !== productId) :
    [...state.wishlistIds, productId]
  })),
  isWishlisted: (productId) => get().wishlistIds.includes(productId)
}));