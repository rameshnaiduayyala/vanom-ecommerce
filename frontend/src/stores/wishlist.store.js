import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "./ui.store.js";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get();
        const exists = items.some((i) => i.id === product.id);
        if (exists) {
          toast.info("Already in Wishlist", `${product.name} is already saved in your wishlist.`);
          return;
        }
        set({ items: [...items, product] });
        toast.success("Saved to Wishlist", `${product.name} added to your wishlist.`);
      },

      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((i) => i.id !== productId) });
        toast.info("Removed from Wishlist", "Item removed from your wishlist.");
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.id === productId);
      },

      toggleWishlist: (product) => {
        const { items, addItem, removeItem } = get();
        if (items.some((i) => i.id === product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "vanom_wishlist_store",
    }
  )
);
